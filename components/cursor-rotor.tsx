"use client";

import { useEffect, useRef } from "react";

export function CursorRotor() {
  const rotorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rotor = rotorRef.current;
    if (!rotor) {
      return;
    }

    let frameId = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotation = 0;
    let targetX = 0;
    let targetY = 0;
    let targetRotation = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      currentRotation += (targetRotation - currentRotation) * 0.12;

      rotor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRotation}deg)`;
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const offsetX = event.clientX - window.innerWidth / 2;
      const offsetY = event.clientY - window.innerHeight / 2;

      targetX = offsetX / 18;
      targetY = offsetY / 20;
      targetRotation = offsetX / 22 + offsetY / 28;
    };

    frameId = window.requestAnimationFrame(render);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-[6vw] top-[11vh] z-0 hidden h-52 w-52 md:block xl:h-60 xl:w-60">
      <div ref={rotorRef} className="relative h-full w-full transition-transform duration-150">
        <div className="absolute inset-0 rounded-[42px] border border-[rgba(255,255,255,0.52)] bg-[linear-gradient(145deg,rgba(255,255,255,0.34),rgba(255,248,236,0.08)_42%,rgba(199,169,118,0.08)_100%)] shadow-[0_34px_70px_rgba(48,33,23,0.18)] backdrop-blur-[34px]">
          <div className="absolute inset-2 rounded-[38px] border border-[rgba(255,255,255,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_44%)]" />
          <div className="absolute inset-5 rounded-[32px] border border-[rgba(199,169,118,0.22)]" />
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_32%_32%,rgba(255,255,255,0.92),rgba(255,246,232,0.26)_44%,rgba(199,169,118,0.14)_64%,transparent_76%)] blur-[1px]" />
          <div className="absolute bottom-3 left-3 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.76),rgba(255,246,232,0.18)_48%,transparent_74%)]" />
          <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle_at_top,#fffdf8,#ecdcc0_38%,#c7a976_68%,#7b5b2d_100%)] shadow-[0_20px_34px_rgba(123,91,45,0.2)]" />
          <div className="absolute inset-[22%] rounded-full border border-dashed border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-6 h-[1px] w-24 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.78),transparent)]" />
          <div className="absolute bottom-6 left-1/2 h-[1px] w-24 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(123,91,45,0.46),transparent)]" />
        </div>
      </div>
    </div>
  );
}
