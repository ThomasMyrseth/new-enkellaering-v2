"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type Card = {
  title: string;
  description: string;
  onClick: () => void;
  src: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    isMobile,
  }: {
    card: Card;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    isMobile: boolean;
  }) => {

    const handleClick = () => {
      if (isMobile) {
        // Toggle hovered state on mobile
        setHovered(hovered === index ? null : index);
      }
    };

    return (
      <div
        {...(!isMobile && {
          onMouseEnter: () => setHovered(index),
          onMouseLeave: () => setHovered(null),
        })}
        onClick={handleClick}
        className={cn(
          "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
        )}
      >
        <Image
          src={card.src || "/enkel_laering_transparent.png"}
          alt={card.title}
          fill
          className="object-cover absolute inset-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/enkel_laering_transparent.png";
          }}
        />
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex flex-col justify-end py-8 px-4 transition-opacity duration-300",
            hovered === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Button 
            className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200"
            onClick={card.onClick}>
            {card.title}
          </Button>
          <div
            className="text-sm md:text-base overflow-y-auto text-neutral-300 mt-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
          {card.description}
        </div>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";


export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title + index}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}