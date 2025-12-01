import { useState, useEffect } from 'react'
import { Plus, Search, Star, Trash2, Settings, TrendingUp, Calendar, Target, X, Flame, ChevronRight } from 'lucide-react'
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
  AreaChart,
  Area,
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
    if (favorites.find(f => f.name === food.name)) {
      toast.info('Already in favorites')
      return
    }
    const updated = [...favorites, food]
    setFavorites(updated)
    localStorage.setItem('dietFavorites', JSON.stringify(updated))
    toast.success('Added to favorites')
  }

  const removeFavorite = (name) => {
    const updated = favorites.filter((f) => f.name !== name)
    setFavorites(updated)
    localStorage.setItem('dietFavorites', JSON.stringify(updated))
    toast.success('Removed from favorites')
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

  const handleAddFood = async (e, overrideName = null, overrideGrams = null) => {
    if (e) e.preventDefault()

    const nameToAdd = overrideName || foodName
    const gramsToAdd = overrideGrams || grams

    if (!nameToAdd || !gramsToAdd) {
      toast.error('Please enter food name and grams')
      return
    }

    setIsLoading(true)
    try {
      const foodItem = await fetchNutrition(nameToAdd, parseFloat(gramsToAdd))

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

      // Clear form if it was a manual add
      if (!overrideName) {
        setFoodName('')
        setGrams('')
      }

      await fetchDietLogs()
      await fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add food')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = (name, defaultGrams = 100) => {
    handleAddFood(null, name, defaultGrams)
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
      toast.success('Calorie limits updated successfully!')
      setShowSettings(false)
      await fetchStats()
    } catch (error) {
      toast.error('Failed to update limits')
    }
  }

  const handleDeleteLog = async (id) => {
    // Removed confirm dialog as requested
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
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diet Tracker</h1>
              <p className="text-gray-500 text-sm">Monitor your daily nutrition</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900"
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
              className="w-full max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gray-50/50">
                <CardTitle className="text-xl font-bold">Calorie Goals</CardTitle>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Daily Goal (kcal)</label>
                    <Input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Monthly Goal (kcal)</label>
                    <Input
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 0)}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1 h-11 rounded-xl">Cancel</Button>
                  <Button onClick={handleUpdateLimits} className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Save Goals</Button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        toast.loading('Sending report...')
                        await api.post('/diet/report/monthly')
                        toast.dismiss()
                        toast.success('Monthly report sent to your email')
                      } catch (error) {
                        toast.dismiss()
                        toast.error('Failed to send report')
                      }
                    }}
                    className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Email Monthly Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Daily Calories */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Daily Calories</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.daily?.total?.toFixed(0) || 0}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stats.daily?.total > stats.daily?.limit ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${Math.min(100, ((stats.daily?.total || 0) / (stats.daily?.limit || 2000)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500">Goal: {stats.daily?.limit}</span>
                    <span className={stats.daily?.remaining > 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.daily?.remaining > 0 ? `${stats.daily.remaining.toFixed(0)} left` : `${Math.abs(stats.daily.remaining).toFixed(0)} over`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Calories */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Total</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.monthly?.total?.toFixed(0) || 0}</h3>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stats.monthly?.total > stats.monthly?.limit ? 'bg-red-500' : 'bg-purple-500'
                        }`}
                      style={{ width: `${Math.min(100, ((stats.monthly?.total || 0) / (stats.monthly?.limit || 60000)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500">Goal: {stats.monthly?.limit}</span>
                    <span className="text-purple-600">
                      {((stats.monthly?.total || 0) / (stats.monthly?.limit || 60000) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protein */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Protein</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.macros?.protein?.toFixed(1) || 0}g</h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-xl text-green-600">
                    <Target className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg w-fit">
                  <TrendingUp className="w-3 h-3" />
                  <span>Daily Intake</span>
                </div>
              </CardContent>
            </Card>

            {/* Carbs & Fat */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Carbs & Fat</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-bold text-gray-900">{stats.macros?.carbs?.toFixed(1) || 0}g</h3>
                      <span className="text-sm text-gray-400">/</span>
                      <h3 className="text-2xl font-bold text-gray-900">{stats.macros?.fat?.toFixed(1) || 0}g</h3>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-lg w-fit">
                  <TrendingUp className="w-3 h-3" />
                  <span>Daily Intake</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Food & Favorites */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Add Food
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => handleAddFood(e)} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Food Name</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="e.g., Apple, Chicken Breast"
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Grams</label>
                      <Input
                        type="number"
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        placeholder="100"
                        required
                        min="1"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Meal</label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add to Log'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Favorites & Recent */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Quick Add</h3>

              {favorites.length > 0 && (
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {favorites.map((food, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <div onClick={() => handleQuickAdd(food.name, food.grams)} className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{food.name}</div>
                          <div className="text-xs text-gray-500">{food.grams}g</div>
                        </div>
                        <button onClick={() => removeFavorite(food.name)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {recentFoods.length > 0 && (
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-500" /> Recent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentFoods.map((food, idx) => (
                      <div key={idx} onClick={() => handleQuickAdd(food.name, 100)} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <div className="font-medium text-gray-900 text-sm">{food.name}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveFavorite({ name: food.name, grams: 100 });
                          }}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Charts and Logs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Macro Breakdown Pie Chart */}
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-gray-900">Macro Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => `${value.toFixed(1)}g`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="#111827">
                          {stats?.daily?.total?.toFixed(0) || 0}
                        </tspan>
                        <tspan x="50%" dy="1.5em" fontSize="12" fill="#6b7280">
                          kcal
                        </tspan>
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Calorie Trend Area Chart */}
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-gray-900">30-Day Calorie Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={calorieBreakdownData}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric' })}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [`${value} kcal`, 'Calories']}
                      />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCalories)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Meal Distribution Chart */}
            {todayLogs.length > 0 && (
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-gray-900">Today's Calorie Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Breakfast', value: todayLogs.filter(l => l.mealType === 'breakfast').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#f97316' },
                            { name: 'Lunch', value: todayLogs.filter(l => l.mealType === 'lunch').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#3b82f6' },
                            { name: 'Dinner', value: todayLogs.filter(l => l.mealType === 'dinner').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#8b5cf6' },
                            { name: 'Snack', value: todayLogs.filter(l => l.mealType === 'snack').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#10b981' },
                          ].filter(i => i.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#374151"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs font-medium"
                              >
                                {`${name} (${value} kcal)`}
                              </text>
                            );
                          }}
                        >
                          {[
                            { name: 'Breakfast', value: todayLogs.filter(l => l.mealType === 'breakfast').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#f97316' },
                            { name: 'Lunch', value: todayLogs.filter(l => l.mealType === 'lunch').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#3b82f6' },
                            { name: 'Dinner', value: todayLogs.filter(l => l.mealType === 'dinner').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#8b5cf6' },
                            { name: 'Snack', value: todayLogs.filter(l => l.mealType === 'snack').reduce((acc, curr) => acc + curr.totalCalories, 0), color: '#10b981' },
                          ].filter(i => i.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value) => [`${value} kcal`, 'Calories']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Logs */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900">Today's Entries</CardTitle>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
              </CardHeader>
              <CardContent>
                {todayLogs.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">No meals tracked yet</p>
                    <p className="text-gray-500 text-sm mt-1">Add your first meal to start tracking</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayLogs.map((log) => (
                      <div
                        key={log._id}
                        className="group p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${log.mealType === 'breakfast' ? 'bg-orange-50 text-orange-600' :
                              log.mealType === 'lunch' ? 'bg-blue-50 text-blue-600' :
                                log.mealType === 'dinner' ? 'bg-purple-50 text-purple-600' :
                                  'bg-green-50 text-green-600'
                              }`}>
                              {log.mealType}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(log.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {log.foodItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-1">
                              <span className="font-medium text-gray-700 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                {item.name}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-xs">{item.quantity}{item.unit}</span>
                                <span className="font-bold text-gray-900">{item.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                          <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                            Total: {log.totalCalories} kcal
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
    </div >
  )
}
