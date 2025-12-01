import { useState, useEffect } from 'react'
import { Plus, Pill, Clock, Calendar, CheckCircle, XCircle, AlertCircle, History, Trash2, Edit2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/medication'

export default function Medication() {
  const { token } = useAuthStore()
  const [medications, setMedications] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ adherence: 0, taken: 0, missed: 0 })
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cause: '',
    dosage: '',
    type: 'Tablet',
    frequency: 'daily',
    times: ['08:00 AM'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalQuantity: '',
    refillReminder: false,
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const [medsRes, statsRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(`${API_URL}/stats`, config)
      ])
      setMedications(medsRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times]
    newTimes[index] = value
    setFormData(prev => ({ ...prev, times: newTimes }))
  }

  const addTimeSlot = () => {
    setFormData(prev => ({ ...prev, times: [...prev.times, '08:00 AM'] }))
  }

  const removeTimeSlot = (index) => {
    setFormData(prev => ({ ...prev, times: prev.times.filter((_, i) => i !== index) }))
  }

  const handleTakeDose = async (medId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.post(`${API_URL}/${medId}/log`, {
        status: 'taken',
        scheduledTime: new Date(),
        takenTime: new Date()
      }, config)
      fetchData()
    } catch (error) {
      console.error('Error logging dose:', error)
    }
  }

  const handleEdit = (med) => {
    setFormData({
      name: med.name,
      cause: med.cause,
      dosage: med.dosage,
      type: med.type,
      frequency: med.frequency,
      times: med.times,
      startDate: med.startDate ? med.startDate.split('T')[0] : '',
      endDate: med.endDate ? med.endDate.split('T')[0] : '',
      totalQuantity: med.totalQuantity || '',
      refillReminder: med.refillReminder || false,
      notes: med.notes || ''
    })
    setEditingId(med._id)
    setShowAddForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Clean form data
      const payload = {
        ...formData,
        totalQuantity: formData.totalQuantity === '' ? null : Number(formData.totalQuantity),
        endDate: formData.endDate === '' ? null : formData.endDate,
        times: formData.times.filter(t => t !== '') // Remove empty time slots
      }

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, config)
      } else {
        await axios.post(API_URL, payload, config)
      }

      setShowAddForm(false)
      setEditingId(null)
      fetchData()
      // Reset form
      setFormData({
        name: '',
        cause: '',
        dosage: '',
        type: 'Tablet',
        frequency: 'daily',
        times: ['08:00 AM'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        totalQuantity: '',
        refillReminder: false,
        notes: ''
      })
    } catch (error) {
      console.error('Error saving medication:', error)
    }
  }

  const getStatusColor = (med) => {
    if (!med.isActive) return 'bg-gray-100 border-gray-200'
    if (med.totalQuantity && med.totalQuantity < 5) return 'bg-red-50 border-red-200'
    return 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medication Tracker</h1>
            <p className="text-gray-500 mt-1">Manage your prescriptions and track adherence</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Adherence Score</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.adherence}%</h3>
                </div>
                <div className={`p-3 rounded-full ${stats.adherence >= 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Prescriptions</p>
                  <h3 className="text-2xl font-bold text-gray-900">{medications.filter(m => m.isActive).length}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Pill className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Missed Doses</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.missed}</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle>Add New Medication</CardTitle>
              <CardDescription>Enter the details of your prescription</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medicine Name</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Amoxicillin" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cause / Condition</label>
                    <Input name="cause" value={formData.cause} onChange={handleInputChange} placeholder="e.g. Bacterial Infection" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dosage</label>
                    <Input name="dosage" value={formData.dosage} onChange={handleInputChange} placeholder="e.g. 500mg" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Drops">Drops</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="twice daily">Twice Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as needed">As Needed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Quantity (Optional)</label>
                    <Input type="number" name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} placeholder="Total pills/volume" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date (Optional)</label>
                    <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder Times</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.times.map((time, index) => {
                      // Parse time string (e.g., "08:00 AM")
                      const [timePart, period] = time.includes(' ') ? time.split(' ') : [time, 'AM']
                      const [hours, minutes] = timePart.includes(':') ? timePart.split(':') : ['08', '00']

                      return (
                        <div key={index} className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border">
                          <select
                            value={hours}
                            onChange={(e) => {
                              const newTime = `${e.target.value}:${minutes} ${period}`
                              handleTimeChange(index, newTime)
                            }}
                            className="bg-transparent text-sm font-medium focus:outline-none"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                              <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <span>:</span>
                          <select
                            value={minutes}
                            onChange={(e) => {
                              const newTime = `${hours}:${e.target.value} ${period}`
                              handleTimeChange(index, newTime)
                            }}
                            className="bg-transparent text-sm font-medium focus:outline-none"
                          >
                            {Array.from({ length: 60 }, (_, i) => i).map(m => (
                              <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <select
                            value={period}
                            onChange={(e) => {
                              const newTime = `${hours}:${minutes} ${e.target.value}`
                              handleTimeChange(index, newTime)
                            }}
                            className="bg-transparent text-sm font-bold text-blue-600 focus:outline-none ml-1"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>

                          {index > 0 && (
                            <button type="button" onClick={() => removeTimeSlot(index)} className="text-red-500 hover:text-red-700 ml-2">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                    <Button type="button" variant="outline" onClick={addTimeSlot} className="text-blue-600 h-9">
                      <Plus className="w-4 h-4 mr-2" /> Add Time
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Medication</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Medications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Active Medications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
              <Card key={med._id} className={`transition-all hover:shadow-lg ${getStatusColor(med)}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">{med.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{med.cause}</CardDescription>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase">
                      {med.type}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{med.frequency} at {med.times.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Pill className="w-4 h-4" />
                    <span>{med.dosage}</span>
                  </div>
                  {med.totalQuantity && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <History className="w-4 h-4" />
                      <span className={med.totalQuantity < 5 ? 'text-red-600 font-bold' : ''}>
                        {med.totalQuantity} remaining
                      </span>
                    </div>
                  )}

                  <div className="pt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleTakeDose(med._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Take
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(med)}>
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

