from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from services.generators.text_generators.g4f_generator_text import G4FGeneratorText
import io
from PIL import Image
from playwright.sync_api import sync_playwright
from playwright.async_api import async_playwright

router = APIRouter(prefix="/generate", tags=["generate"])

@router.post("")
async def generate_text(request: dict):
    print("/generate entered")
    generator = G4FGeneratorText()
    try:
        # Extract prompt from request
        prompt = request.get("prompt")
        if not prompt:
            return {"error": "Prompt is required"}

        # Generate text using the generator
        generated_text = generator.gen_text(prompt)
        print("Generated text:", generated_text)

        return {"generated_text": generated_text}

    except Exception as e:
        return {"error": str(e)}



async def svg_to_gif(svg_content: str, width=800, height=600, fps=30, duration=7) -> bytes:
    total_frames = fps * duration
    frames = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": width, "height": height})

        html_content = f'''
        <html><body style="margin:0">
        <div id="container" style="width:{width}px; height:{height}px">
        {svg_content}
        </div>
        </body></html>
        '''

        await page.set_content(html_content)

        for frame_num in range(total_frames):
            screenshot_bytes = await page.locator("#container").screenshot()
            frame = Image.open(io.BytesIO(screenshot_bytes)).convert("RGBA")
            frames.append(frame)

        await browser.close()

    gif_bytes_io = io.BytesIO()
    frames[0].save(
        gif_bytes_io,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / fps),
        loop=0,
        disposal=2,
        optimize=True,
    )
    gif_bytes_io.seek(0)
    return gif_bytes_io.read()


@router.post("/svg-file-to-gif")
async def svg_file_to_gif_local():
    import os
    svg_path = os.path.join(os.path.dirname(__file__), "test.svg")
    gif_path = os.path.join(os.path.dirname(__file__), "test.gif")
    try:
        with open(svg_path, "r", encoding="utf-8") as f:
            svg_str = f.read()
        gif_bytes = await svg_to_gif(svg_str)  # <-- await here!
        with open(gif_path, "wb") as f:
            f.write(gif_bytes)
        return {"success": True, "gif_path": gif_path}
    except Exception as e:
        return {"error": str(e)}