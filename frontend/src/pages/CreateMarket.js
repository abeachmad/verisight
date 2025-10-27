import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '@/context/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateMarket = () => {
  const navigate = useNavigate();
  const { isConnected, getAuthHeaders } = useWallet();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Event details
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [category, setCategory] = useState('');

  // Market details
  const [marketTitle, setMarketTitle] = useState('');
  const [marketDescription, setMarketDescription] = useState('');
  const [options, setOptions] = useState([{ id: 'option-1', label: '', odds: 2.0 }]);

  const addOption = () => {
    const newId = `option-${options.length + 1}`;
    setOptions([...options, { id: newId, label: '', odds: 2.0 }]);
  };

  const removeOption = (id) => {
    if (options.length > 1) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const updateOption = (id, field, value) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDescription || !category) {
      toast.error('Please fill in all event fields');
      return;
    }

    try {
      const response = await axios.post(
        `${API}/events`,
        {
          event_title: eventTitle,
          event_description: eventDescription,
          category: category
        },
        { headers: getAuthHeaders() }
      );

      toast.success('Event created! Now create a market for it.');
      return response.data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!marketTitle || !marketDescription) {
      toast.error('Please fill in all market fields');
      return;
    }

    if (options.some((opt) => !opt.label || opt.odds <= 0)) {
      toast.error('Please complete all options with valid values');
      return;
    }

    setSubmitting(true);
    try {
      // First create event
      const eventId = await handleCreateEvent();

      // Then create market
      await axios.post(
        `${API}/markets`,
        {
          event_id: eventId,
          title: marketTitle,
          description: marketDescription,
          options: options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            odds: parseFloat(opt.odds),
            volume: 0
          }))
        },
        { headers: getAuthHeaders() }
      );

      toast.success('Market created successfully!');
      navigate('/markets');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-['Orbitron'] font-bold text-[#00FFFF] mb-4">
            Create Prediction Market
          </h1>
          <p className="text-[#A9B4C2]">
            Create an event and set up a prediction market for others to trade
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div
            className={`flex items-center space-x-2 ${
              step === 1 ? 'text-[#00FFFF]' : 'text-[#A9B4C2]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 1 ? 'border-[#00FFFF] bg-[#00FFFF]/20' : 'border-[#A9B4C2]'
              }`}
            >
              1
            </div>
            <span>Event Details</span>
          </div>
          <div className="h-0.5 w-16 bg-[#A9B4C2]"></div>
          <div
            className={`flex items-center space-x-2 ${
              step === 2 ? 'text-[#00FFFF]' : 'text-[#A9B4C2]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 2 ? 'border-[#00FFFF] bg-[#00FFFF]/20' : 'border-[#A9B4C2]'
              }`}
            >
              2
            </div>
            <span>Market Details</span>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-[#141b2d] border-[#00FFFF]/30 p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="text-[#00FFFF] font-semibold mb-2 block">Event Title</label>
                <Input
                  placeholder="e.g., Will Bitcoin reach $100k by end of 2025?"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                  data-testid="event-title-input"
                />
              </div>

              <div>
                <label className="text-[#00FFFF] font-semibold mb-2 block">
                  Event Description
                </label>
                <Textarea
                  placeholder="Provide detailed context about the event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
                  className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                  data-testid="event-description-input"
                />
              </div>

              <div>
                <label className="text-[#00FFFF] font-semibold mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                    data-testid="category-select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141b2d] border-[#00FFFF]/30">
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!eventTitle || !eventDescription || !category}
                className="w-full bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold"
                data-testid="next-step-btn"
              >
                Next: Market Details
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-[#00FFFF] font-semibold mb-2 block">Market Title</label>
                <Input
                  placeholder="e.g., Bitcoin $100k Prediction Market"
                  value={marketTitle}
                  onChange={(e) => setMarketTitle(e.target.value)}
                  className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                  data-testid="market-title-input"
                />
              </div>

              <div>
                <label className="text-[#00FFFF] font-semibold mb-2 block">
                  Market Description
                </label>
                <Textarea
                  placeholder="Describe the market rules and conditions..."
                  value={marketDescription}
                  onChange={(e) => setMarketDescription(e.target.value)}
                  rows={3}
                  className="bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                  data-testid="market-description-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[#00FFFF] font-semibold">Market Options</label>
                  <Button
                    onClick={addOption}
                    size="sm"
                    variant="outline"
                    className="border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/10"
                    data-testid="add-option-btn"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <Input
                        placeholder="Option label (e.g., Yes, No)"
                        value={option.label}
                        onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                        className="flex-1 bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                        data-testid={`option-label-${index}`}
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Odds"
                        value={option.odds}
                        onChange={(e) => updateOption(option.id, 'odds', e.target.value)}
                        className="w-24 bg-[#0A0F1F] border-[#00FFFF]/30 text-[#00FFFF]"
                        data-testid={`option-odds-${index}`}
                      />
                      {options.length > 1 && (
                        <Button
                          onClick={() => removeOption(option.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/10"
                  data-testid="back-btn"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#00FFFF] text-[#0A0F1F] hover:bg-[#00cccc] font-semibold glow"
                  data-testid="create-market-btn"
                >
                  {submitting ? 'Creating...' : 'Create Market'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateMarket;