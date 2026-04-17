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
    <div className="pointer-events-none fixed right-[7vw] top-[12vh] z-0 hidden h-48 w-48 md:block xl:h-56 xl:w-56">
      <div ref={rotorRef} className="relative h-full w-full transition-transform duration-150">
        <div className="absolute inset-0 rounded-[38px] border border-[rgba(255,255,255,0.46)] bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,248,236,0.12))] shadow-[0_30px_60px_rgba(48,33,23,0.16)] backdrop-blur-[28px]">
          <div className="absolute inset-4 rounded-[30px] border border-[rgba(199,169,118,0.32)]" />
          <div className="absolute inset-8 rounded-full border border-dashed border-[rgba(123,91,45,0.34)]" />
          <div className="absolute inset-[28%] rounded-full bg-[radial-gradient(circle_at_top,#fffdf8,#ecdcc0_42%,#c7a976_72%,#7b5b2d_100%)] shadow-[0_18px_30px_rgba(123,91,45,0.18)]" />
          <div className="absolute left-1/2 top-5 h-[1px] w-20 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(123,91,45,0.58),transparent)]" />
          <div className="absolute bottom-5 left-1/2 h-[1px] w-20 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(123,91,45,0.58),transparent)]" />
        </div>
      </div>
    </div>
  );
}
