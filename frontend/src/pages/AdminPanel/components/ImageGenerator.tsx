import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  getAvailableGenerators,
  generateImage,
  getGenerationStatus,
  ApiError,
} from "../../../api/images";
import { getCategories } from "../../../api/categories";
import { createWallpaper } from "../../../api/wallpapers";
import { Category } from "../../../models/category";
import { SelectableBadges } from "../../../components/Badges/SelectableBadges/SelectableBadges";
import { Button } from "../../../components/Buttons/BaseButton";
import { Loader } from "../../../components/Loader/Loader";
import { Alert } from "../../../components/Alert/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { ImageDimensions } from "../../../components/ImageDimensions/ImageDimensions";
import { TagManager } from "../../../components/TagManager/TagManager";
import { toast } from "react-toastify";
import styles from "./ImageGenerator.module.scss";
import {
  GenerateImageResponse,
  GenerateImageRequest,
} from "../../../models/images";

interface ImageGeneratorForm {
  generator_type: string;
  category: string;
  width: number;
  height: number;
  tags: string[];
}

const DEFAULT_SETTINGS = {
  width: 1024,
  height: 768,
  tags: ["wallpaper", "high quality", "masterpiece"],
};

const POLLING_INTERVAL = 2000; // 2 seconds

export const ImageGenerator: React.FC = () => {
  const [generators, setGenerators] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] =
    useState<GenerateImageResponse | null>(null);

  const { handleSubmit, setValue, watch } = useForm<ImageGeneratorForm>({
    defaultValues: {
      width: DEFAULT_SETTINGS.width,
      height: DEFAULT_SETTINGS.height,
      generator_type: "",
      category: "",
      tags: DEFAULT_SETTINGS.tags,
    },
  });

  const selectedGenerator = watch("generator_type");
  const selectedCategory = watch("category");
  const tags = watch("tags");

  const checkTaskStatus = useCallback(async () => {
    if (!taskId) return;

    try {
      const responseStatus = await getGenerationStatus(taskId);

      if (responseStatus.status === "success" && responseStatus.url_path) {
        setGenerationStatus(responseStatus);
        // Create wallpaper when generation is successful
        try {
          await createWallpaper({
            image_url: responseStatus.url_path,
            image_thumb_url: responseStatus.url_path_thumb,
            ...(responseStatus.url_path_medium && { image_medium_url: responseStatus.url_path_medium }),
            category: selectedCategory,
            tags: tags,
          });
          toast.success("Wallpaper saved successfully!");
        } catch (err) {
          const error = err as ApiError;
          setError(error.error || "Failed to create wallpaper");
        }
        setTaskId(null);
        setIsGenerating(false);
      } else if (responseStatus.status === "failed") {
        toast.error(
          "Image generation failed. " + (responseStatus?.error ?? "")
        );
        setTaskId(null);
        setIsGenerating(false);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.error || "Failed to check generation status");
      setTaskId(null);
      setIsGenerating(false);
    }
  }, [taskId, selectedCategory, tags]);

  const handleGeneratorSelect = (generator: string) => {
    setValue("generator_type", generator);
  };

  const handleCategorySelect = (categoryName: string) => {
    setValue("category", categoryName);
  };

  const handleTagsChange = (newTags: string[]) => {
    setValue("tags", newTags);
  };

  const generatePrompt = (category: string, tags: string[]) => {
    return [...tags, category].join(", ");
  };

  const onSubmit = async (data: ImageGeneratorForm) => {
    setIsGenerating(true);
    setError("");
    setGenerationStatus(null);
    try {
      const request: GenerateImageRequest = {
        prompt: generatePrompt(data.category, data.tags),
        width: data.width,
        height: data.height,
        generator_type: data.generator_type,
        category: data.category,
        tags: [...data.tags, data.category],
      };
      const response = await generateImage(request);

      if (
        (response.status === "pending" || response.status === "started") &&
        response.task_id
      ) {
        setTaskId(response.task_id);
      } else if (response.status === "success" && response.url_path) {
        setGenerationStatus(response);
        setIsGenerating(false);
      } else {
        setError("Unexpected response from server");
        setIsGenerating(false);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.error || "Failed to generate image");
      setIsGenerating(false);
    }
  };

  const handleErrorClose = () => {
    setError("");
  };

  const handleManualCreateWallpaper = async () => {
    if (!generationStatus?.url_path || !selectedCategory) return;

    try {
      await createWallpaper({
        image_url: generationStatus?.url_path,
        image_thumb_url: generationStatus?.url_path_thumb,
        ...(generationStatus?.url_path_medium && { image_medium_url: generationStatus?.url_path_medium }),
        category: selectedCategory,
        tags: tags,
      });
      toast.success("Wallpaper created successfully!");
    } catch (err) {
      const error = err as ApiError;
      setError(error.error || "Failed to create wallpaper");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [generatorsData, categoriesData] = await Promise.all([
          getAvailableGenerators(),
          getCategories(),
        ]);
        setGenerators(generatorsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setValue("category", categoriesData[0].name);
        }
      } catch (err) {
        const error = err as ApiError;
        setError(error.error || "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (taskId) {
      pollingInterval = setInterval(checkTaskStatus, POLLING_INTERVAL);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [taskId, checkTaskStatus]);

  return (
    <div className={styles.imageGenerator}>
      <h3>Image Generation</h3>
      {error && (
        <Alert type="error" message={error} onClose={handleErrorClose} />
      )}
      <div className={styles.content}>
        <div className={styles.sidebar}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <Loader size="large" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <h4>Available Generators</h4>
              <SelectableBadges
                items={generators}
                onSelect={handleGeneratorSelect}
              />
              <h4>Categories</h4>
              <SelectableBadges
                items={categories.map((cat) => cat.name)}
                onSelect={handleCategorySelect}
              />
              <ImageDimensions
                width={watch("width")}
                height={watch("height")}
                onWidthChange={(width) => setValue("width", width)}
                onHeightChange={(height) => setValue("height", height)}
              />
              <TagManager tags={tags} onTagsChange={handleTagsChange} />
              <div className={styles.promptPreview}>
                <h4>Prompt Preview</h4>
                <div className={styles.prompt}>
                  {generatePrompt(selectedCategory, tags)}
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    !selectedGenerator || !selectedCategory || isGenerating
                  }
                >
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    className={styles.buttonIcon}
                  />
                  {isGenerating ? "Generating..." : "Generate Image"}
                </Button>
                {generationStatus && !isGenerating && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleManualCreateWallpaper}
                  >
                    Save Wallpaper
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
        {generationStatus && (
          <div className={styles.preview}>
            <h4>Generated Image</h4>
            <img
              src={generationStatus.url_path}
              alt="Generated wallpaper"
              className={styles.previewImage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
