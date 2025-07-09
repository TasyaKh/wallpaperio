import random
import json
from services.wallpapers_service import WallpapersService
from services.generators.text_generators.g4f_generator_text import G4FGeneratorText
from services.generators.image_generators.g4f_generator import G4FGenerator
from services.images.imgfoto_service import ImgFotoService
from models.wallpaper import WallpaperCreate

image_service = ImgFotoService()


def generate_wallpapers_job():
    """
    Job to generate wallpapers.
    """
    print("Starting periodic wallpaper generation...")
    wallpapers_service = WallpapersService()
    text_generator = G4FGeneratorText()
    image_generator = G4FGenerator()

    try:
        categories = wallpapers_service.get_categories()
        if not categories:
            print("No categories found.")
            return

        selected_categories = random.sample(categories, min(3, len(categories)))

        for category in selected_categories:
            print(f"Generating for category: {category.name}")
            try:
                # Generate prompt and tags
                prompt_data_str = text_generator.gen_image_prompt(category.name)
                prompt_data = json.loads(prompt_data_str)
                prompt = prompt_data.get("prompt")
                tags = prompt_data.get("tags", [])

                if not prompt:
                    print(f"Could not generate prompt for category {category.name}")
                    continue
                width, height = 1080, 2340

                # Generate image phone resolution
                image_data = image_generator.gen_image(prompt, width, height)

                # Save image
                saved_data = image_service.save_image(image_data)

                # Create wallpaper
                wallpaper_data = WallpaperCreate(
                    image_url=saved_data.url_path,
                    image_thumb_url=saved_data.url_path_thumb,
                    image_medium_url=(
                        saved_data.url_path_medium
                        if saved_data.url_path_medium
                        else None
                    ),
                    width=saved_data.width,
                    height=saved_data.height,
                    category=category.name,
                    tags=tags,
                    prompt=prompt,
                )
                wallpapers_service.create_wallpaper(wallpaper_data)
                print(f"Successfully created wallpaper")

            except Exception as e:
                print(f"Error generating wallpaper for category {category.name}: {e}")

    except Exception as e:
        print(f"An error occurred during wallpaper generation: {e}")
