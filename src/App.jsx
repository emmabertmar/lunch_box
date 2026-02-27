import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import UploadRecipe from './pages/UploadRecipe'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import EditRecipe from './pages/EditRecipe'
import MyRecipes from './pages/MyRecipes'
import RandomRecipe from './pages/RandomRecipe'
import SavedRecipes from './pages/SavedRecipes'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={<Home />} />

          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadRecipe />
            </ProtectedRoute>
          } />

          <Route path="/recipe/:id" element={<RecipeDetail />} />

          <Route path="/recipe/:id/edit" element={
            <ProtectedRoute>
              <EditRecipe />
            </ProtectedRoute>
          } />

          <Route path="/random" element={<RandomRecipe />} />

          <Route path="/my-recipes" element={
            <ProtectedRoute>
              <MyRecipes />
            </ProtectedRoute>
          } />

          <Route path="/saved" element={
            <ProtectedRoute>
              <SavedRecipes />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
