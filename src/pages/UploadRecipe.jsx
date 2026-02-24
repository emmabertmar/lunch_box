import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getCurrentWeek } from '../utils/weekNumber'

export default function UploadRecipe() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null) // shows a preview of the selected photo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // When the user picks a photo, show a preview immediately
  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let photo_url = null

    // 1. Upload the photo to Supabase Storage if one was selected
    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}` // unique path per user

      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError('Failed to upload photo. Please try again.')
        setLoading(false)
        return
      }

      // Get the public URL of the uploaded photo
      const { data: urlData } = supabase.storage
        .from('recipe-photos')
        .getPublicUrl(fileName)

      photo_url = urlData.publicUrl
    }

    // 2. Save the recipe to the database
    const { week_number, year } = getCurrentWeek()

    const { error: insertError } = await supabase.from('recipes').insert({
      user_id: user.id,
      title,
      description,
      ingredients,
      instructions,
      photo_url,
      week_number,
      year
    })

    if (insertError) {
      setError('Failed to save recipe. Please try again.')
      setLoading(false)
      return
    }

    // 3. Success — go back to the home page
    navigate('/')
  }

  return (
    <div className="upload-container">
      <h1>Upload a recipe</h1>
      <p className="upload-subtitle">Share what you're cooking this week</p>

      <form onSubmit={handleSubmit} className="upload-form">

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Creamy pasta with spinach"
            required
          />
        </div>

        <div className="form-group">
          <label>Short description <span className="optional">(optional)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A quick 20-minute meal perfect for students"
          />
        </div>

        <div className="form-group">
          <label>Ingredients</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. 200g pasta, 1 bag of spinach, 1 clove of garlic..."
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe how to make the recipe step by step..."
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Photo <span className="optional">(optional)</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="file-input"
          />
          {preview && (
            <img src={preview} alt="Preview" className="photo-preview" />
          )}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit recipe'}
        </button>

      </form>
    </div>
  )
}
