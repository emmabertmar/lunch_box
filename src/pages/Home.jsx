import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentWeek } from '../utils/weekNumber'
import RecipeCard from '../components/RecipeCard'
import WinnerBanner from '../components/WinnerBanner'

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [lastWinner, setLastWinner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
    checkAndSetWinner()
    fetchLastWinner()
  }, [])

  async function fetchRecipes() {
    const { week_number, year } = getCurrentWeek()

    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles(username),
        likes(id, user_id)
      `)
      .eq('week_number', week_number)
      .eq('year', year)
      .order('created_at', { ascending: false })

    if (!error) setRecipes(data)
    setLoading(false)
  }

  // Fetch the most recently recorded weekly winner to show in the banner
  async function fetchLastWinner() {
    const { data, error } = await supabase
      .from('weekly_winners')
      .select(`
        *,
        recipes(
          id, title, photo_url, description,
          profiles(username),
          likes(id)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) setLastWinner(data)
  }

  // On Sundays: check if a winner has been picked for this week.
  // If not, find the recipe with the most likes and save it as the winner.
  async function checkAndSetWinner() {
    const today = new Date()
    if (today.getDay() !== 0) return // only run on Sunday (0 = Sunday)

    const { week_number, year } = getCurrentWeek()

    // Check if a winner already exists for this week
    const { data: existing } = await supabase
      .from('weekly_winners')
      .select('id')
      .eq('week_number', week_number)
      .eq('year', year)
      .maybeSingle()

    if (existing) return // winner already picked

    // Get all recipes this week with their like counts
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, likes(id)')
      .eq('week_number', week_number)
      .eq('year', year)

    if (!recipes || recipes.length === 0) return

    const sorted = [...recipes].sort((a, b) => b.likes.length - a.likes.length)
    const topRecipe = sorted[0]

    if (topRecipe.likes.length === 0) return

    await supabase.from('weekly_winners').insert({
      recipe_id: topRecipe.id,
      week_number,
      year
    })

    fetchLastWinner()
  }

  if (loading) return <div className="feed-message">Loading recipes...</div>

  return (
    <div className="feed-container">

      {lastWinner && <WinnerBanner winner={lastWinner} />}

      <div className="feed-header">
        <h1>This week's recipes</h1>
        <p>Week {getCurrentWeek().week_number} — vote for your favourite!</p>
      </div>

      {recipes.length === 0 ? (
        <div className="feed-message">
          No recipes yet this week. Be the first to upload one!
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
