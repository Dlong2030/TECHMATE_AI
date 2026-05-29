// Hook quản lý ảnh nhân vật
// Quy tắc đặt tên file trong /public/characters/:
//   dra_idle.png  → miệng đóng
//   dra_talk.png  → miệng mở

const slugify = (name: string) =>
    name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')

const useCharacterImages = (characterName: string) => {
    const slug = slugify(characterName)
    const base = `/characters/${slug}`

    // Trả về đường dẫn — nếu file không tồn tại
    // component sẽ fallback về SVG tự động qua onError
    return {
        idleImage: `${base}_idle.png`,
        talkImage: `${base}_talk.png`,
        slug,
    }
}

export default useCharacterImages