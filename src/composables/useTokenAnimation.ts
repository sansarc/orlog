import gsap from 'gsap';
import {audioManager} from "../core/audio/AudioManager.ts";

export function useTokenAnimation() {
    function animateTokens(
        sourceElements: HTMLElement[],
        targetElement: HTMLElement,
        onComplete: () => void,
        sfx = false
    ) {
        if (!targetElement || sourceElements.length === 0) {
            console.warn("Skipping token animation: Target or Sources missing", { targetElement, sources: sourceElements.length });
            onComplete();
            return;
        }

        if (sfx)
            audioManager.playSFX('token-assignment');

        const targetRect = targetElement.getBoundingClientRect();
        // center of target
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        let completedAnimations = 0;

        sourceElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.width = '20px';
            particle.style.height = '20px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = '#ffd700';
            particle.style.boxShadow = '0 0 10px #ffd700, 0 0 20px #ffaa00';
            particle.style.zIndex = '9999';
            particle.style.pointerEvents = 'none';

            document.body.appendChild(particle);

            gsap.to(particle, {
                x: targetX - startX,
                y: targetY - startY,
                duration: 2,
                ease: 'power2.inOut',
                onComplete: () => {
                    particle.remove();
                    completedAnimations++;
                    if (completedAnimations === sourceElements.length)
                        onComplete();
                }
            });
        });
    }

    return { animateTokens };
}