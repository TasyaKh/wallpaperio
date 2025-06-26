from typing import Dict, Type
from services.generators.image_generators.image_generator import ImageGenerator
from services.generators.image_generators.fusion_brain_generator import FusionBrainAIGenerator
from services.generators.image_generators.g4f_generator import G4FGenerator
from services.generators.image_generators.g4f_pollinations_generator import G4FPollinationsGenerator

_generators: Dict[str, Type[ImageGenerator]] = {
    "fusion_brain": FusionBrainAIGenerator,
    "g4f_4o": G4FPollinationsGenerator,
    "g4f_default": G4FGenerator
}

class GeneratorFactory:
    @classmethod
    def get_generator(cls, generator_type: str) -> ImageGenerator:
        generator_class = _generators.get(generator_type)
        if not generator_class:
            raise ValueError(f"Unsupported generator type: {generator_type}")
        return generator_class()

    @classmethod
    def get_available_generators(cls) -> list[str]:
        return list(_generators.keys()) 