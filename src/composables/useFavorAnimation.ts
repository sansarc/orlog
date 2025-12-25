import gsap from "gsap";

export function useFavorAnimation() {

    /**
     * The Universal "God Power" Animation.
     * Target: The specific Totem image that is being invoked.
     * Effect: Gold Glow + Shake + Scale Pulse.
     */
    function animateFavorActivation(element: HTMLElement): Promise<void> {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            const tl = gsap.timeline({ onComplete: resolve });

            tl.to(element, {
                opacity: 1,
                scale: 1.5,
                duration: 0.3,
                ease: "back.out(2)"
            })
            // intense pulse
            .to(element, {
                scale: 1.2,
                opacity: 0.8,
                duration: 0.1,
                yoyo: true,
                repeat: 5
            })
            // fade out
            .to(element, {
                opacity: 0,
                scale: 2,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }

    return animateFavorActivation;
}