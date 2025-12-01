import { useState, useEffect } from 'react'
import { Plus, Search, Star, Trash2, Settings, TrendingUp, Calendar, Target, X } from 'lucide-react'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import api from '../../lib/axios.js'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CALORIE_NINJAS_API_KEY = 'UOHWaWZnOuIFYZs3389AcQ==57d0pjsTnFOLDDUz'
const CALORIE_NINJAS_URL = 'https://api.calorieninjas.com/v1/nutrition'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Diet() {
  const [foodName, setFoodName] = useState('')
  const [grams, setGrams] = useState('')
  const [mealType, setMealType] = useState('breakfast')
  const [isLoading, setIsLoading] = useState(false)
  const [dietLogs, setDietLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [dailyLimit, setDailyLimit] = useState(2000)
  const [monthlyLimit, setMonthlyLimit] = useState(60000)
  const [showSettings, setShowSettings] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [recentFoods, setRecentFoods] = useState([])

  // Fetch diet logs and stats
  useEffect(() => {
    fetchDietLogs()
    fetchStats()
    loadFavorites()
  }, [])

  const fetchDietLogs = async () => {
    try {
      const response = await api.get('/diet')
      setDietLogs(response.data)
      
      // Extract recent foods (last 10 unique)
      const recent = []
      response.data.slice(0, 10).forEach((log) => {
        log.foodItems.forEach((item) => {
          if (!recent.find((f) => f.name === item.name)) {
            recent.push({ name: item.name, calories: item.calories })
          }
        })
      })
      setRecentFoods(recent.slice(0, 10))
    } catch (error) {
      console.error('Error fetching diet logs:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/diet/stats')
      setStats(response.data)
      if (response.data.daily?.limit) setDailyLimit(response.data.daily.limit)
      if (response.data.monthly?.limit) setMonthlyLimit(response.data.monthly.limit)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('dietFavorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }

  const saveFavorite = (food) => {
    const updated = [...favorites, food]
    setFavorites(updated)
    localStorage.setItem('dietFavorites', JSON.stringify(updated))
  }

  const removeFavorite = (name) => {
    const updated = favorites.filter((f) => f.name !== name)
    setFavorites(updated)
    localStorage.setItem('dietFavorites', JSON.stringify(updated))
  }

  const fetchNutrition = async (foodName, grams) => {
    try {
      const response = await fetch(`${CALORIE_NINJAS_URL}?query=${encodeURIComponent(foodName)}`, {
        headers: {
          'X-Api-Key': CALORIE_NINJAS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch nutrition data')
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        throw new Error('Food not found')
      }

      const nutrition = data.items[0]
      const scale = grams / 100 // Scale factor

      return {
        name: nutrition.name,
        quantity: grams,
        unit: 'g',
        calories: Math.round(nutrition.calories * scale),
        protein: Math.round(nutrition.protein_g * scale * 10) / 10,
        carbs: Math.round(nutrition.carbohydrates_total_g * scale * 10) / 10,
        fat: Math.round(nutrition.fat_total_g * scale * 10) / 10,
      }
    } catch (error) {
      console.error('Error fetching nutrition:', error)
      throw error
    }
  }

  const handleAddFood = async (e) => {
    e.preventDefault()
    if (!foodName || !grams) {
      toast.error('Please enter food name and grams')
      return
    }

    setIsLoading(true)
    try {
      const foodItem = await fetchNutrition(foodName, parseFloat(grams))
      
      // Calculate total calories for this meal
      const existingMealLogs = dietLogs.filter(
        (log) =>
          log.mealType === mealType &&
          new Date(log.date).toDateString() === new Date().toDateString()
      )
      const mealCalories = existingMealLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)
      const totalCalories = mealCalories + foodItem.calories

      const response = await api.post('/diet', {
        mealType,
        foodItems: [foodItem],
        totalCalories: foodItem.calories,
        date: new Date(),
      })

      toast.success('Food added successfully!')
      
      // Ask if user wants to save as favorite
      if (!favorites.find((f) => f.name === foodItem.name)) {
        const saveAsFavorite = confirm('Save this food as favorite?')
        if (saveAsFavorite) {
          saveFavorite({ name: foodItem.name, grams: parseFloat(grams) })
        }
      }
      
      setFoodName('')
      setGrams('')
      await fetchDietLogs()
      await fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add food')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async (name, defaultGrams = 100) => {
    setFoodName(name)
    setGrams(defaultGrams.toString())
    // Auto-submit after a brief delay
    setTimeout(async () => {
      const form = document.querySelector('form')
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(event)
      }
    }, 100)
  }

  const handleUpdateLimits = async () => {
    // Validation
    if (!dailyLimit || dailyLimit < 0) {
      toast.error('Please enter a valid daily calorie limit')
      return
    }
    if (!monthlyLimit || monthlyLimit < 0) {
      toast.error('Please enter a valid monthly calorie limit')
      return
    }
    if (monthlyLimit < dailyLimit) {
      toast.error('Monthly limit should be greater than or equal to daily limit')
      return
    }

    try {
      await api.put('/diet/limits', {
        daily: parseInt(dailyLimit),
        monthly: parseInt(monthlyLimit),
      })
      toast.success('Calorie limits updated successfully!', {
        description: 'You will receive email notifications when limits are exceeded.',
      })
      setShowSettings(false)
      await fetchStats()
    } catch (error) {
      toast.error('Failed to update limits', {
        description: error.response?.data?.message || 'Please try again',
      })
    }
  }

  const handleDeleteLog = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      await api.delete(`/diet/${id}`)
      toast.success('Entry deleted')
      await fetchDietLogs()
      await fetchStats()
    } catch (error) {
      toast.error('Failed to delete entry')
    }
  }

  // Prepare chart data
  const macroData = stats
    ? [
        { name: 'Protein', value: stats.macros?.protein || 0, color: COLORS[0] },
        { name: 'Carbs', value: stats.macros?.carbs || 0, color: COLORS[1] },
        { name: 'Fat', value: stats.macros?.fat || 0, color: COLORS[2] },
      ]
    : []

  const calorieBreakdownData = stats?.dailyBreakdown || []

  const todayLogs = dietLogs.filter(
    (log) => new Date(log.date).toDateString() === new Date().toDateString()
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diet Tracker</h1>
            <p className="text-gray-600 mt-1">Track your nutrition and calories</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <Card 
              className="w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl font-bold">Calorie Limits</CardTitle>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Daily Calorie Limit (kcal)
                  </label>
                  <Input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      setDailyLimit(value)
                    }}
                    min="0"
                    className="w-full h-12 text-base"
                    placeholder="e.g., 2000"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 2000-2500 kcal for adults
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Monthly Calorie Limit (kcal)
                  </label>
                  <Input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      setMonthlyLimit(value)
                    }}
                    min="0"
                    className="w-full h-12 text-base"
                    placeholder="e.g., 60000"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 60,000 kcal (2000 × 30 days)
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You'll receive email notifications when you exceed these limits.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateLimits} className="flex-1">
                    Save Limits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Daily Calories</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.daily?.total?.toFixed(0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      of {stats.daily?.limit || 2000} kcal
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-500 flex-shrink-0" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stats.daily?.total > stats.daily?.limit
                          ? 'bg-red-500'
                          : stats.daily?.total > (stats.daily?.limit || 2000) * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ((stats.daily?.total || 0) / (stats.daily?.limit || 2000)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    stats.daily?.remaining > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {stats.daily?.remaining > 0
                      ? `${stats.daily.remaining.toFixed(0)} kcal remaining`
                      : `${Math.abs(stats.daily?.remaining || 0).toFixed(0)} kcal over limit`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Monthly Calories</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.monthly?.total?.toFixed(0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      of {stats.monthly?.limit || 60000} kcal
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-indigo-500 flex-shrink-0" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stats.monthly?.total > stats.monthly?.limit
                          ? 'bg-red-500'
                          : stats.monthly?.total > (stats.monthly?.limit || 60000) * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ((stats.monthly?.total || 0) / (stats.monthly?.limit || 60000)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    stats.monthly?.remaining > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {stats.monthly?.remaining > 0
                      ? `${stats.monthly.remaining.toFixed(0)} kcal remaining`
                      : `${Math.abs(stats.monthly?.remaining || 0).toFixed(0)} kcal over limit`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Protein</p>
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.macros?.protein?.toFixed(1) || 0}g
                </p>
                <p className="text-xs text-gray-500 mt-2">Macronutrient</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Carbs / Fat</p>
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.macros?.carbs?.toFixed(1) || 0}g
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.macros?.fat?.toFixed(1) || 0}g
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Macronutrients</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Food */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Add Food</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFood} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Food Name
                    </label>
                    <Input
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      placeholder="e.g., Apple, Chicken Breast"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Grams
                    </label>
                    <Input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      placeholder="100"
                      required
                      min="1"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full h-12 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Food
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Favorites */}
            {favorites.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {favorites.map((food, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => handleQuickAdd(food.name, food.grams)}
                          className="flex-1 text-left text-sm font-medium hover:text-blue-600 transition-colors"
                        >
                          {food.name} <span className="text-gray-500">({food.grams}g)</span>
                        </button>
                        <button
                          onClick={() => removeFavorite(food.name)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Foods */}
            {recentFoods.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Foods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentFoods.map((food, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAdd(food.name, 100)}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                      >
                        {food.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Charts and Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Macro Breakdown Pie Chart */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Macro Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Calorie Breakdown Bar Chart */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Macro Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={macroData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Daily Trend Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold">30-Day Calorie Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={calorieBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`${value} kcal`, 'Calories']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Calories"
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Today's Logs */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Today's Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {todayLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No entries for today</p>
                    <p className="text-gray-400 text-sm mt-2">Start tracking your meals!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full capitalize">
                              {log.mealType}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(log.date).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log._id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2 mb-3">
                          {log.foodItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                              <span className="font-medium text-gray-900">
                                {item.name} <span className="text-gray-500">({item.quantity}{item.unit})</span>
                              </span>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="font-semibold text-blue-600">{item.calories} kcal</span>
                                <span className="text-gray-500">P:{item.protein}g</span>
                                <span className="text-gray-500">C:{item.carbs}g</span>
                                <span className="text-gray-500">F:{item.fat}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total Calories</span>
                            <span className="text-lg font-bold text-blue-600">
                              {log.totalCalories} kcal
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
