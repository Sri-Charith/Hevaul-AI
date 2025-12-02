import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import {
  Moon,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Brain,
  Trash2,
  Edit2,
  Plus,
  Save,
  X,
  Sparkles
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'sonner'

const API_URL = 'http://localhost:3000/api/sleep'

// Helper for 12h time picker
const TimePicker = ({ label, value, onChange, subLabel }) => {
  // value is expected to be "HH:mm" (24h)
  const [hours, minutes] = value ? value.split(':') : ['00', '00']

  // Convert to 12h for display
  let h = parseInt(hours, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12 // Convert 0 to 12

  const handleChange = (newH, newM, newP) => {
    let h24 = parseInt(newH, 10)
    if (newP === 'PM' && h24 !== 12) h24 += 12
    if (newP === 'AM' && h24 === 12) h24 = 0

    const hStr = h24.toString().padStart(2, '0')
    const mStr = newM.toString().padStart(2, '0')
    onChange(`${hStr}:${mStr}`)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <select
          value={h}
          onChange={(e) => handleChange(e.target.value, minutes, period)}
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <span className="self-center font-bold text-gray-400">:</span>
        <select
          value={minutes}
          onChange={(e) => handleChange(h, e.target.value, period)}
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {Array.from({ length: 60 }, (_, i) => i).map(num => (
            <option key={num} value={num.toString().padStart(2, '0')}>
              {num.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => handleChange(h, minutes, e.target.value)}
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
    </div>
  )
}

export default function Sleep() {
  const { token } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    startTime: '22:00', // Default 10 PM
    endTime: '07:00',   // Default 7 AM
    quality: 'Good',
    mood: '😐',
    notes: ''
  })

  // Fetch Data
  useEffect(() => {
    fetchData()
    // Load cached insights
    const cached = localStorage.getItem('sleep_insights')
    if (cached) {
      setInsights(JSON.parse(cached))
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [logsRes, statsRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(`${API_URL}/stats`, config)
      ])

      setLogs(logsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching sleep data:', error)
      toast.error('Failed to load sleep data')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      setInsightsLoading(true)
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await axios.get(`${API_URL}/insights`, config)
      const newInsights = res.data.insights || []
      setInsights(newInsights)
      localStorage.setItem('sleep_insights', JSON.stringify(newInsights))
      toast.success('New insights generated!')
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    } finally {
      setInsightsLoading(false)
    }
  }

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTimeChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      startTime: '22:00',
      endTime: '07:00',
      quality: 'Good',
      mood: '😐',
      notes: ''
    })
    setIsEditing(false)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Construct Date objects
      const today = new Date()
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number)
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number)

      const wakeDate = new Date(today)
      wakeDate.setHours(endHours, endMinutes, 0, 0)

      const sleepDate = new Date(today)
      sleepDate.setHours(startHours, startMinutes, 0, 0)

      // Logic: If sleep time is later than wake time (e.g. 23:00 vs 07:00), 
      // assume sleep started yesterday.
      if (sleepDate > wakeDate) {
        sleepDate.setDate(sleepDate.getDate() - 1)
      }

      const payload = {
        ...formData,
        startTime: sleepDate.toISOString(),
        endTime: wakeDate.toISOString()
      }

      if (isEditing) {
        await axios.put(`${API_URL}/${editId}`, payload, config)
        toast.success('Sleep log updated')
      } else {
        await axios.post(API_URL, payload, config)
        toast.success('Sleep log added')
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving log:', error)
      toast.error(error.response?.data?.message || 'Failed to save log')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Log deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete log')
    }
  }

  const handleEdit = (log) => {
    setIsEditing(true)
    setEditId(log._id)

    // Extract HH:mm from ISO strings
    const startDate = new Date(log.startTime)
    const endDate = new Date(log.endTime)

    // Format to HH:mm for internal state (24h)
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }

    setFormData({
      startTime: formatTime(startDate),
      endTime: formatTime(endDate),
      quality: log.quality,
      mood: log.mood,
      notes: log.notes || ''
    })
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Helpers
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDebtStatus = (debt) => {
    if (debt <= 0) return { label: 'Well Rested', color: 'text-green-600', bg: 'bg-green-100' }
    if (debt < 5) return { label: 'Mild Sleep Debt', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { label: 'Severe Sleep Debt', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const debtInfo = stats ? getDebtStatus(stats.sleepDebt) : { label: 'Loading...', color: 'text-gray-500', bg: 'bg-gray-100' }

  // Chart Data Preparation
  const weeklyData = stats?.logs?.map(log => ({
    day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: log.duration,
    score: log.sleepScore,
    quality: log.quality
  })) || []

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Moon className="w-8 h-8 text-indigo-600" />
              Sleep Tracker
            </h1>
            <p className="text-gray-500 mt-1">Monitor your sleep patterns and improve your rest</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sleep Score */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${stats?.avgScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                Avg Score
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-gray-900">{stats?.avgScore || 0}</h3>
              <p className="text-sm text-gray-500">Weekly Average</p>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Target: 8h</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-gray-900">{stats?.avgDuration || 0}h</h3>
              <p className="text-sm text-gray-500">Avg. Duration</p>
            </div>
          </div>

          {/* Sleep Debt */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${debtInfo.bg}`}>
                <AlertCircle className={`w-6 h-6 ${debtInfo.color}`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${debtInfo.bg} ${debtInfo.color}`}>
                {debtInfo.label}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className={`text-3xl font-bold ${debtInfo.color}`}>{stats?.sleepDebt || 0}h</h3>
              <p className="text-sm text-gray-500">Sleep Debt (Weekly)</p>
            </div>
          </div>

          {/* Total Logs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-gray-900">{stats?.totalLogs || 0}</h3>
              <p className="text-sm text-gray-500">Total Entries</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isEditing ? 'Edit Sleep Log' : 'Log Sleep'}
                </h2>
                {isEditing && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <TimePicker
                    label="Sleep Start Time"
                    value={formData.startTime}
                    onChange={(val) => handleTimeChange('startTime', val)}
                    subLabel="Usually yesterday"
                  />
                  <TimePicker
                    label="Wake-up Time"
                    value={formData.endTime}
                    onChange={(val) => handleTimeChange('endTime', val)}
                    subLabel="Today"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quality</label>
                    <select
                      name="quality"
                      value={formData.quality}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mood</label>
                    <select
                      name="mood"
                      value={formData.mood}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xl"
                    >
                      <option value="😊">😊 Happy</option>
                      <option value="😐">😐 Neutral</option>
                      <option value="😫">😫 Tired</option>
                      <option value="😴">😴 Sleepy</option>
                      <option value="😡">😡 Grumpy</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any dreams or disturbances?"
                    rows="3"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update Log' : 'Save Log'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Charts & History */}
          <div className="lg:col-span-2 space-y-6">

            {/* Weekly Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Sleep Trends</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <ReferenceLine y={8} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target (8h)', fill: '#10B981', fontSize: 12 }} />
                    <Bar
                      dataKey="hours"
                      fill="#4F46E5"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Logs List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent History</h3>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No sleep logs yet. Start tracking today!</p>
                ) : (
                  logs.map((log) => (
                    <div key={log._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-white shadow-sm`}>
                          {log.mood}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {new Date(log.date).toLocaleDateString()}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white border ${log.quality === 'Excellent' ? 'border-green-200 text-green-700' :
                              log.quality === 'Good' ? 'border-blue-200 text-blue-700' :
                                log.quality === 'Average' ? 'border-yellow-200 text-yellow-700' :
                                  'border-red-200 text-red-700'
                              }`}>
                              {log.quality}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="mx-2">•</span>
                            {log.duration}h
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className={`font-bold text-lg ${getScoreColor(log.sleepScore)}`}>
                            {log.sleepScore}
                          </div>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* AI Insights Box - Moved to Bottom */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain className="w-48 h-48" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                <Brain className="w-8 h-8 text-indigo-300" />
                AI Sleep Insights
              </h3>
              <p className="text-indigo-200">Get personalized analysis and recommendations based on your sleep patterns.</p>
            </div>
            <button
              onClick={generateInsights}
              disabled={insightsLoading}
              className="px-6 py-3 bg-white text-indigo-900 font-semibold rounded-xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {insightsLoading ? 'Analyzing...' : 'Generate New Insights'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-lg leading-relaxed text-indigo-50">{insight}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-50" />
                <p className="text-indigo-200 text-lg">No insights generated yet.</p>
                <p className="text-indigo-400 text-sm mt-2">Click the button above to analyze your sleep data.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
