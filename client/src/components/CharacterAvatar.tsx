import { useEffect, useRef } from 'react'
import '../styles/CharacterAvatar.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    name: string
    idleImage?: string   // ảnh miệng đóng
    talkImage?: string   // ảnh miệng mở
    isTalking: boolean
    size?: number        // px, default 200
    emoji?: string       // fallback khi chưa có ảnh
}

// ─── SVG Placeholder khi chưa có ảnh ─────────────────────────────────────────

const AvatarSVG = ({ emoji, isTalking, size }: {
    emoji: string
    isTalking: boolean
    size: number
}) => {
    const mouthPath = isTalking
        ? 'M 60 100 Q 100 130 140 100'  // miệng mở
        : 'M 70 95 Q 100 105 130 95'    // miệng đóng

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Glow khi đang nói */}
            {isTalking && (
                <circle cx="100" cy="100" r="98" fill="rgba(249,115,22,0.08)" />
            )}

            {/* Background circle */}
            <circle cx="100" cy="100" r="90" fill="#2a1a0e" />
            <circle cx="100" cy="100" r="86" fill="#3d2510" />

            {/* Emoji */}
            <text x="100" y="85" textAnchor="middle" fontSize="60" dominantBaseline="middle">
                {emoji}
            </text>

            {/* Mouth */}
            <path
                d={mouthPath}
                stroke="#F97316"
                strokeWidth="4"
                strokeLinecap="round"
                fill={isTalking ? 'rgba(249,115,22,0.3)' : 'none'}
                style={{ transition: 'd 0.1s ease' }}
            />

            {/* Eyes */}
            <circle cx="75" cy="115" r="5" fill="white" opacity="0.9" />
            <circle cx="125" cy="115" r="5" fill="white" opacity="0.9" />

            {/* Eye blink animation */}
            <ellipse
                cx="75" cy="115" rx="5" ry="0"
                fill="#2a1a0e"
                className={isTalking ? 'eye-blink' : ''}
            />
            <ellipse
                cx="125" cy="115" rx="5" ry="0"
                fill="#2a1a0e"
                className={isTalking ? 'eye-blink' : ''}
            />
        </svg>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CharacterAvatar = ({
    name,
    idleImage,
    talkImage,
    isTalking,
    size = 200,
    emoji = '🤖',
}: Props) => {
    const hasImages = !!idleImage
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Khi có ảnh thật: toggle idle/talk mỗi 200ms khi đang nói
    const imgRef = useRef<HTMLImageElement>(null)
    const isToggled = useRef(false)

    useEffect(() => {
        if (!hasImages || !imgRef.current) return

        if (isTalking) {
            intervalRef.current = setInterval(() => {
                if (!imgRef.current) return
                isToggled.current = !isToggled.current
                imgRef.current.src = isToggled.current
                    ? (talkImage || idleImage || '')
                    : (idleImage || '')
            }, 180)
        } else {
            clearInterval(intervalRef.current!)
            if (imgRef.current && idleImage) {
                imgRef.current.src = idleImage
            }
        }

        return () => clearInterval(intervalRef.current!)
    }, [isTalking, hasImages, idleImage, talkImage])

    return (
        <div
            className={`char-avatar-wrap ${isTalking ? 'talking' : ''}`}
            style={{ width: size, height: size }}
            aria-label={name}
        >
            {hasImages ? (
                // Có ảnh thật
                <img
                    ref={imgRef}
                    src={idleImage}
                    alt={name}
                    className="char-avatar-img"
                    draggable={false}
                />
            ) : (
                // SVG placeholder
                <AvatarSVG emoji={emoji} isTalking={isTalking} size={size} />
            )}

            {/* Glow ring khi đang nói */}
            {isTalking && <div className="glow-ring" />}
        </div>
    )
}

export default CharacterAvatar