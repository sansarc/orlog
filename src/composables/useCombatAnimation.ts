import gsap from "gsap";
import {audioManager} from "../core/audio/AudioManager.ts";
import type {IDie} from "../core/interfaces.ts";

export function useCombatAnimation() {
    /**
     * Animates a die flying to hit another element (Die or Player).
     */
    function animateAttack(
        attackerEl: HTMLElement,
        targetEl: HTMLElement,
        isBlocked: boolean,
        attackerDie: IDie
    ): Promise<void> {

        return new Promise((resolve) => {
            if (!attackerEl || !targetEl) {
                resolve();
                return;
            }

            const startRect = attackerEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();

            const startX = startRect.left + startRect.width / 2;
            const startY = startRect.top + startRect.height / 2;
            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;

            const clone = attackerEl.cloneNode(true) as HTMLElement;
            document.body.appendChild(clone);

            // Position clone exactly over original
            clone.style.position = 'fixed';
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            clone.style.width = `${startRect.width}px`;
            clone.style.height = `${startRect.height}px`;
            clone.style.zIndex = '1000';
            clone.style.margin = '0'; // Reset any margins

            // Hide original temporarily
            attackerEl.style.opacity = '0';

            const tl = gsap.timeline({
                onComplete: () => {
                    clone.remove();
                    attackerEl.style.opacity = '1';
                    resolve();
                }
            });

            // pull back
            tl.to(clone, {
                scale: 1.2,
                duration: 0.2,
                ease: "back.in(1.7)"
            })
            // strike (move to target)
            .to(clone, {
                x: endX - startX,
                y: endY - startY,
                rotation: isBlocked ? 45 : 0,
                duration: 0.5,
                ease: "power4.in"
            })
            // impact effect
            .add(() => {
                if (isBlocked) {
                    flashColor(targetEl, '#fff'); // white flash for blocks
                    if (attackerDie.face === 'ARROW')
                        audioManager.playSFX('arrow-hitting-shield')
                    else
                        audioManager.playSFX('axe-hitting-helmet')
                }
                else {
                    flashColor(targetEl, '#ff0000');
                    shake(targetEl);
                    if (attackerDie.face === 'ARROW')
                        audioManager.playSFX('arrow-hitting-player')
                    else if (attackerDie.face === 'AXE')
                        audioManager.playSFX('axe-hitting-player')
                    else
                        audioManager.playSFX('hand-swoosh')
                }
            })
            // quick fade out / snap back
            .to(clone, {
                opacity: 0,
                duration: 0.5,
                delay: 0.5
            });
        });
    }

    function shake(el: HTMLElement) {
        gsap.fromTo(el, { x: -5 }, { x: 5, duration: 0.05, repeat: 5, yoyo: true });
    }

    function flashColor(el: HTMLElement, color: string) {
        gsap.to(el, { backgroundColor: color, duration: 0.1, repeat: 1, yoyo: true });
    }

    return { animateAttack };
}