import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import dashboardImage from "@assets/generated_images/Gigster_Garage_Dashboard_Interface_bf394ced.png";
import taskFormImage from "@assets/generated_images/Gigster_Garage_Task_Form_5a9a2db0.png";
import kanbanImage from "@assets/generated_images/Gigster_Garage_Kanban_Board_bca840aa.png";

interface Screenshot {
  id: string;
  title: string;
  description: string;
  image: string;
}

const screenshots: Screenshot[] = [
  {
    id: "dashboard",
    title: "My Dashboard",
    description: "Clean, intuitive task overview with priority badges and project organization",
    image: dashboardImage
  },
  {
    id: "task-form",
    title: "Task Creation",
    description: "Simple form to create tasks with due dates, priorities, and project assignment",
    image: taskFormImage
  },
  {
    id: "kanban",
    title: "Project Board",
    description: "Kanban-style project management with drag-and-drop task organization",
    image: kanbanImage
  }
];

export function ScreenshotCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Image Display */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-2xl">
        <img
          src={screenshots[currentIndex].image}
          alt={screenshots[currentIndex].title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-gray-200 shadow-lg"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-gray-200 shadow-lg"
        >
          <ChevronRight size={20} />
        </Button>

        {/* Auto-play Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoPlay}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white border-gray-200 shadow-lg"
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>

        {/* Overlay with Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <h3 className="text-white font-bold text-xl mb-1">
            {screenshots[currentIndex].title}
          </h3>
          <p className="text-white/90 text-sm">
            {screenshots[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex justify-center mt-6 space-x-4">
        {screenshots.map((screenshot, index) => (
          <button
            key={screenshot.id}
            onClick={() => goToSlide(index)}
            className={`relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-teal-500 ring-2 ring-teal-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <img
              src={screenshot.image}
              alt={screenshot.title}
              className="w-full h-full object-cover"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-teal-500/20" />
            )}
          </button>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {screenshots.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-teal-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}