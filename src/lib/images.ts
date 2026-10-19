import { requireSupabaseConfiguration } from './constants'
import { isSupabaseConfigured, supabase } from './supabase'

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, 800 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Impossible de préparer cette image.'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('La compression de l’image a échoué.'))
      }, 'image/jpeg', 0.8)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Le fichier « ${file.name} » ne peut pas être lu comme une image.`))
    }
    image.src = objectUrl
  })
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  requireSupabaseConfiguration(isSupabaseConfigured)
  const image = await compressImage(file)
  const path = `products/${productId}/${Date.now()}-${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('product-images').upload(path, image, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export async function uploadShopLogo(file: File, ownerId: string): Promise<string> {
  requireSupabaseConfiguration(isSupabaseConfigured)
  const image = await compressImage(file)
  const path = `shops/${ownerId}/${Date.now()}-${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('product-images').upload(path, image, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}
