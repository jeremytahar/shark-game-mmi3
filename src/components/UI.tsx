import { useEffect, useState } from 'react';

type UIProps = {
    defeatedCount: number
    totalCount: number
}

export function UI({ defeatedCount, totalCount }: UIProps) {
    const [keys, setKeys] = useState({ forward: false, back: false, left: false, right: false, jump: false, click: false })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyZ' || e.code === 'KeyW' || e.code === 'ArrowUp') setKeys((k) => ({ ...k, forward: true }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys((k) => ({ ...k, back: true }))
            if (e.code === 'KeyQ' || e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys((k) => ({ ...k, left: true }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys((k) => ({ ...k, right: true }))
            if (e.code === 'Space') setKeys((k) => ({ ...k, jump: true }))
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'KeyZ' || e.code === 'KeyW' || e.code === 'ArrowUp') setKeys((k) => ({ ...k, forward: false }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys((k) => ({ ...k, back: false }))
            if (e.code === 'KeyQ' || e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys((k) => ({ ...k, left: false }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys((k) => ({ ...k, right: false }))
            if (e.code === 'Space') setKeys((k) => ({ ...k, jump: false }))
        }
        const handlePointerDown = () => setKeys((k) => ({ ...k, click: true }))
        const handlePointerUp = () => setKeys((k) => ({ ...k, click: false }))
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointerup', handlePointerUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointerup', handlePointerUp)
        }
    }, [])

    const [locked, setLocked] = useState(false)

    useEffect(() => {
        const onChange = () => setLocked(!!document.pointerLockElement)
        document.addEventListener('pointerlockchange', onChange)
        return () => document.removeEventListener('pointerlockchange', onChange)
    }, [])

    const baseClass = "w-14 h-14 flex items-center justify-center text-xl font-bold rounded-xl border-2 border-white/20 transition-all duration-100";
    const activeClass = "bg-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.5)]";
    const inactiveClass = "bg-black/40 text-white backdrop-blur-md";

    const allDefeated = defeatedCount === totalCount;

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            {!locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-md text-white text-lg font-bold px-8 py-4 rounded-2xl border-2 border-white/20 select-none">
                        Clique pour contrôler la caméra
                    </div>
                </div>
            )}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white font-bold text-lg px-6 py-3 rounded-2xl border-2 border-white/20 select-none">
                {allDefeated
                    ? 'Tous les crabes ont été éliminés ! Bravo 🎉'
                    : `Crabes : ${defeatedCount} / ${totalCount}`}
            </div>
            {!allDefeated && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white font-semibold text-sm px-5 py-2 rounded-xl border border-white/20 select-none">
                    Approche un crabe et clique pour l'éliminer
                </div>
            )}
            <div className="absolute bottom-10 left-10 flex gap-2 items-end">
                <div className="flex flex-col items-center gap-2 select-none">
                    <div className={`${baseClass} ${keys.forward ? activeClass : inactiveClass}`}>Z</div>
                    <div className="flex gap-2">
                        <div className={`${baseClass} ${keys.left ? activeClass : inactiveClass}`}>Q</div>
                        <div className={`${baseClass} ${keys.back ? activeClass : inactiveClass}`}>S</div>
                        <div className={`${baseClass} ${keys.right ? activeClass : inactiveClass}`}>D</div>
                    </div>
                </div>
                <div className={`${baseClass} w-25 h-14 ${keys.jump ? activeClass : inactiveClass}`}>
                    Espace
                </div>
                <div className={`${baseClass} ${keys.click ? activeClass : inactiveClass} text-sm`}>
                    Clic
                </div>
            </div>
        </div>
    );
}
