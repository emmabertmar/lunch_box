import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function EditRecipe() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState([''])
  const [focusIndex, setFocusIndex] = useState(null)
  const [focusInstructionIndex, setFocusInstructionIndex] = useState(null)
  const ingredientRefs = useRef([])
  const instructionRefs = useRef([])
  const fileInputRef = useRef(null)
  const [instructions, setInstructions] = useState([''])
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipe()
  }, [id])

  async function fetchRecipe() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) { navigate('/'); return }
    if (data.user_id !== user.id) { navigate('/'); return }

    setTitle(data.title)
    setDescription(data.description || '')
    const parsed = data.ingredients.split(/\n|,/).map(s => s.trim()).filter(Boolean)
    setIngredients(parsed.length > 0 ? parsed : [''])
    const parsedInstructions = data.instructions.split(/\n/).map(s => s.trim()).filter(Boolean)
    setInstructions(parsedInstructions.length > 0 ? parsedInstructions : [''])
    setExistingPhotoUrl(data.photo_url)
    setLoading(false)
  }

  useEffect(() => {
    if (focusIndex !== null && ingredientRefs.current[focusIndex]) {
      ingredientRefs.current[focusIndex].focus()
      setFocusIndex(null)
    }
  }, [focusIndex])

  function handleIngredientChange(index, value) {
    setIngredients(prev => prev.map((item, i) => i === index ? value : item))
  }

  function handleIngredientKeyDown(e, index) {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIngredients(prev => [...prev.slice(0, index + 1), '', ...prev.slice(index + 1)])
      setFocusIndex(index + 1)
    }
    if (e.key === 'Backspace' && ingredients[index] === '' && ingredients.length > 1) {
      e.preventDefault()
      setIngredients(prev => prev.filter((_, i) => i !== index))
      setFocusIndex(index - 1)
    }
  }

  function removeIngredient(index) {
    if (ingredients.length === 1) { setIngredients(['']); return }
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (focusInstructionIndex !== null && instructionRefs.current[focusInstructionIndex]) {
      instructionRefs.current[focusInstructionIndex].focus()
      setFocusInstructionIndex(null)
    }
  }, [focusInstructionIndex])

  function handleInstructionChange(index, value) {
    setInstructions(prev => prev.map((item, i) => i === index ? value : item))
  }

  function handleInstructionKeyDown(e, index) {
    if (e.key === 'Enter') {
      e.preventDefault()
      setInstructions(prev => [...prev.slice(0, index + 1), '', ...prev.slice(index + 1)])
      setFocusInstructionIndex(index + 1)
    }
    if (e.key === 'Backspace' && instructions[index] === '' && instructions.length > 1) {
      e.preventDefault()
      setInstructions(prev => prev.filter((_, i) => i !== index))
      setFocusInstructionIndex(index - 1)
    }
  }

  function removeInstruction(index) {
    if (instructions.length === 1) { setInstructions(['']); return }
    setInstructions(prev => prev.filter((_, i) => i !== index))
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    let photo_url = existingPhotoUrl

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError('Det gick inte att ladda upp bilden. Försök igen.')
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('recipe-photos')
        .getPublicUrl(fileName)

      photo_url = urlData.publicUrl
    }

    const ingredientsString = ingredients.filter(s => s.trim()).join('\n')
    const instructionsString = instructions.filter(s => s.trim()).join('\n')

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ title, description, ingredients: ingredientsString, instructions: instructionsString, photo_url })
      .eq('id', id)

    if (updateError) {
      setError('Det gick inte att spara ändringarna. Försök igen.')
      setSaving(false)
      return
    }

    navigate(`/recipe/${id}`)
  }

  if (loading) return <div className="feed-message">Laddar...</div>

  return (
    <div className="upload-container">
      <h1>Redigera recept</h1>
      <p className="upload-subtitle">Uppdatera ditt recept</p>

      <form onSubmit={handleSubmit} className="upload-form">

        <div className="form-group">
          <label>Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Kort beskrivning <span className="optional">(valfri)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Ingredienser</label>
          <ul className="ingredient-inputs">
            {ingredients.map((item, i) => (
              <li key={i} className="ingredient-input-row">
                <span className="ingredient-bullet">•</span>
                <input
                  ref={el => ingredientRefs.current[i] = el}
                  type="text"
                  value={item}
                  onChange={(e) => handleIngredientChange(i, e.target.value)}
                  onKeyDown={(e) => handleIngredientKeyDown(e, i)}
                  placeholder="t.ex. 200g pasta"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-ingredient"
                    onClick={() => removeIngredient(i)}
                  >×</button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-add-ingredient"
            onClick={() => { setIngredients(prev => [...prev, '']); setFocusIndex(ingredients.length) }}
          >+ Lägg till ingrediens</button>
        </div>

        <div className="form-group">
          <label>Gör så här</label>
          <ol className="instruction-inputs">
            {instructions.map((step, i) => (
              <li key={i} className="instruction-input-row">
                <span className="instruction-number">{i + 1}</span>
                <input
                  ref={el => instructionRefs.current[i] = el}
                  type="text"
                  value={step}
                  onChange={(e) => handleInstructionChange(i, e.target.value)}
                  onKeyDown={(e) => handleInstructionKeyDown(e, i)}
                  placeholder={`Steg ${i + 1}`}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-ingredient"
                    onClick={() => removeInstruction(i)}
                  >×</button>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="btn-add-ingredient"
            onClick={() => { setInstructions(prev => [...prev, '']); setFocusInstructionIndex(instructions.length) }}
          >+ Lägg till steg</button>
        </div>

        <div className="form-group">
          <label>Foto <span className="optional">(valfri — lämna tom för att behålla nuvarande)</span></label>
          {existingPhotoUrl && !preview && (
            <img src={existingPhotoUrl} alt="Current photo" className="photo-preview" />
          )}
          <div className="file-picker">
            <button type="button" className="btn-file" onClick={() => fileInputRef.current.click()}>
              Välj fil
            </button>
            <span className="file-name">{photo ? photo.name : 'Ingen fil vald'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          {preview && (
            <img src={preview} alt="New photo preview" className="photo-preview" />
          )}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Sparar...' : 'Spara ändringar'}
        </button>

      </form>
    </div>
  )
}
