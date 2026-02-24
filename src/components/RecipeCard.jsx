import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function RecipeCard({ recipe, onLikeToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Check if the current user has already liked this recipe
  const alreadyLiked = recipe.likes?.some(like => like.user_id === user?.id)
  const [liked, setLiked] = useState(alreadyLiked)
  const [likeCount, setLikeCount] = useState(recipe.likes?.length ?? 0)
  const [loading, setLoading] = useState(false)

  async function handleLike(e) {
    // Stop the click from also opening the recipe detail page
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    if (liked) {
      // Remove the like
      await supabase.from('likes')
        .delete()
        .eq('recipe_id', recipe.id)
        .eq('user_id', user.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      // Add a like
      await supabase.from('likes')
        .insert({ recipe_id: recipe.id, user_id: user.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }

    setLoading(false)
  }

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      {recipe.photo_url
        ? <img src={recipe.photo_url} alt={recipe.title} className="card-photo" />
        : <div className="card-photo-placeholder">{recipe.title[0]}</div>
      }

      <div className="card-body">
        <p className="card-username">@{recipe.profiles?.username}</p>
        <h2 className="card-title">{recipe.title}</h2>
        {recipe.description && (
          <p className="card-description">{recipe.description}</p>
        )}

        <div className="card-footer">
          <button
            className={`btn-like ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
          >
            ♥ {likeCount}
          </button>

          <span className="card-views">{recipe.views} views</span>
        </div>
      </div>
    </div>
  )
}
