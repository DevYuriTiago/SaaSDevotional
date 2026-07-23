/**
 * Prepara uma foto de perfil no navegador ANTES do upload:
 * recorta o centro em quadrado (ideal para avatar redondo), reduz para
 * `size`px e comprime em JPEG. Uma foto de 12 MB do celular vira ~80 KB.
 */
export async function compressAvatar(file: File, size = 512, quality = 0.85): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    try {
        const side = Math.min(bitmap.width, bitmap.height);
        const sx = (bitmap.width - side) / 2;
        const sy = (bitmap.height - side) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas indisponível");

        ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
        );
        if (!blob) throw new Error("Falha ao processar a imagem");
        return blob;
    } finally {
        bitmap.close?.();
    }
}
