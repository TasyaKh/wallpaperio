import json
from g4f import Client

class G4FGeneratorText:
    def __init__(self):
        self.client = Client()

    def gen_image_prompt(
        self,
        category: str,
    ) -> str:
        generation_prompt = f"""
            Generate a random short prompt for an image generation AI, include 
            that image must be in some style, also add specific description for category
            (for example if it is an animal then mark which type animal it must be, if it is an anime also mention this anime name (naruto, etc.)).
            The prompt should be in the category: '{category}'.
            Also, generate a list of relevant tags for the prompt.

            Provide the response in a JSON format like this: {{"prompt": "a beautiful landscape...", "tags": ["tag1", "tag2"]}}
            Do not include the category in the JSON output. Only include 'prompt' and 'tags'.
            """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": generation_prompt}],
            )
            generated_text = response.choices[0].message.content

            if generated_text:
                # The model might return the JSON inside a code block, so we need to clean it.
                if "```json" in generated_text:
                    clean_json_str = (
                        generated_text.split("```json")[1].split("```")[0].strip()
                    )
                elif "```" in generated_text:
                    clean_json_str = (
                        generated_text.split("```")[1].split("```")[0].strip()
                    )
                else:
                    clean_json_str = generated_text.strip()

                try:
                    data = json.loads(clean_json_str)
                    generated_prompt = data.get("prompt", "")
                    tags = data.get("tags", [])
                except json.JSONDecodeError:
                    generated_prompt = ""
                    tags = []
            else:
                generated_prompt = ""
                tags = []

        except Exception as e:
            # For debugging, you might want to log the error
            print(f"Error during text generation with g4f: {e}")
            generated_prompt = ""
            tags = []
        print("Generated prompt:", generated_prompt)
        final_response = {
            "prompt": generated_prompt,
            "tags": tags,
            "category": category,
        }

        return json.dumps(final_response)
