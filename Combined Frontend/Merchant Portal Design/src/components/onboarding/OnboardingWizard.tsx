import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Upload, 
  Plus, 
  Trash2,
  Camera,
  CheckCircle
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

// Updated Interface to include Step 5 fields
interface BusinessData {
  name: string;
  industry: string;
  address: string;
  timezone: string;
  about: string;
  policies: string;
  cancellationPolicy: string;
  depositRequired: boolean;
  services: any[];
  staff: any[];
  // New fields for Step 5
  breakTime: number;
  bookAhead: number;
  workingHours: any; 
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for Image Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // State for Text Data
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    industry: '',
    address: '',
    timezone: '',
    about: '',
    policies: '',
    cancellationPolicy: '',
    depositRequired: false,
    services: [],
    staff: [],
    // Default values for Step 5
    breakTime: 15,
    bookAhead: 30,
    workingHours: {
      Monday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Tuesday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Wednesday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Thursday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Friday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Saturday: { open: true, start: '09:00 AM', end: '06:00 PM' },
      Sunday: { open: false, start: '09:00 AM', end: '06:00 PM' },
    }
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const submitDataToBackend = async () => {
    try {
      const formData = new FormData();

      // 1. Append files
      if (logoFile) formData.append('logo', logoFile);
      if (coverFile) formData.append('cover_photo', coverFile);

      // 2. Prepare text data
      const allData = {
        name: businessData.name,
        industry: businessData.industry,
        address: businessData.address,
        timezone: businessData.timezone,
        about: businessData.about,
        policies: businessData.policies,
        cancellationPolicy: businessData.cancellationPolicy,
        depositRequired: businessData.depositRequired,
        services: businessData.services,
        staff: businessData.staff,
        // Ensure these get sent
        breakTime: businessData.breakTime,
        bookAhead: businessData.bookAhead,
        workingHours: businessData.workingHours
      };

      formData.append('data', JSON.stringify(allData));

      // 3. Send to Backend
      const response = await fetch('http://localhost:5000/api/onboard/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Merchant Created! ID:", result.merchantId);
        alert("Setup Complete! Your business has been created.");
        onComplete(); 
      } else {
        alert("Error saving data: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to connect to server. Is the backend terminal running?");
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitDataToBackend(); 
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addService = () => {
    const newService = {
      id: Date.now(),
      name: '',
      duration: 30,
      price: 0,
      description: ''
    };
    setBusinessData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const addStaff = () => {
    const newStaff = {
      id: Date.now(),
      name: '',
      bio: '',
      services: []
    };
    setBusinessData(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input 
                    id="business-name" 
                    value={businessData.name}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your business name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={businessData.industry} onValueChange={(value) => setBusinessData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salon & Beauty</SelectItem>
                      <SelectItem value="restaurant">Restaurant & Dining</SelectItem>
                      <SelectItem value="sports">Sports & Recreation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Business Logo</Label>
                    <label 
                      htmlFor="logo-upload" 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:bg-muted/50 transition-colors relative"
                    >
                      <input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLogoFile(e.target.files[0]);
                          }
                        }}
                      />
                      {logoFile ? (
                        <div className="text-sm text-green-600 font-medium flex flex-col items-center">
                           <CheckCircle className="h-8 w-8 mb-2" />
                           {logoFile.name}
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload logo</p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Cover Photo Upload */}
                  <div className="space-y-2">
                    <Label>Cover Photo</Label>
                    <label 
                      htmlFor="cover-upload" 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:bg-muted/50 transition-colors relative"
                    >
                      <input 
                        id="cover-upload" 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCoverFile(e.target.files[0]);
                          }
                        }}
                      />
                      {coverFile ? (
                        <div className="text-sm text-green-600 font-medium flex flex-col items-center">
                           <CheckCircle className="h-8 w-8 mb-2" />
                           {coverFile.name}
                        </div>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload cover</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={businessData.address}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, City, State" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={businessData.timezone} onValueChange={(value) => setBusinessData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">About & Policies</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="about">About Your Business</Label>
                  <Textarea 
                    id="about"
                    value={businessData.about}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, about: e.target.value }))}
                    placeholder="Tell customers about your business, what makes you special..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policies">Things to Know Before Booking</Label>
                  <Textarea 
                    id="policies"
                    value={businessData.policies}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, policies: e.target.value }))}
                    placeholder="Important information for customers before they book..."
                    className="min-h-[100px]"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Booking Policies</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cancellation">Cancellation & No-show Policy</Label>
                    <Textarea 
                      id="cancellation"
                      value={businessData.cancellationPolicy}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                      placeholder="Describe your cancellation policy and no-show fees..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Deposit</Label>
                      <p className="text-sm text-muted-foreground">
                        Require customers to pay a deposit when booking
                      </p>
                    </div>
                    <Switch 
                      checked={businessData.depositRequired}
                      onCheckedChange={(checked) => setBusinessData(prev => ({ ...prev, depositRequired: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Add the services you offer</p>
                  <Button onClick={addService} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                
                {businessData.services.map((service, index) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Service Name</Label>
                          <Input 
                              value={service.name}
                              onChange={(e) => {
                                  const newServices = [...businessData.services];
                                  newServices[index].name = e.target.value;
                                  setBusinessData(prev => ({ ...prev, services: newServices }));
                              }}
                              placeholder="e.g., Haircut" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input 
                              type="number" 
                              value={service.duration}
                              onChange={(e) => {
                                  const newServices = [...businessData.services];
                                  newServices[index].duration = parseInt(e.target.value) || 0;
                                  setBusinessData(prev => ({ ...prev, services: newServices }));
                              }}
                              placeholder="60" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input 
                              type="number" 
                              value={service.price}
                              onChange={(e) => {
                                  const newServices = [...businessData.services];
                                  newServices[index].price = parseInt(e.target.value) || 0;
                                  setBusinessData(prev => ({ ...prev, services: newServices }));
                              }}
                              placeholder="50" 
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                  const newServices = businessData.services.filter((_, i) => i !== index);
                                  setBusinessData(prev => ({ ...prev, services: newServices }));
                              }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {businessData.services.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No services added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Add your team members</p>
                  <Button onClick={addStaff} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
                
                {businessData.staff.map((member, index) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback>
                              <Camera className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Input 
                                placeholder="Staff member name" 
                                value={member.name}
                                onChange={(e) => {
                                    const newStaff = [...businessData.staff];
                                    newStaff[index].name = e.target.value;
                                    setBusinessData(prev => ({ ...prev, staff: newStaff }));
                                }}
                            />
                            <Textarea 
                                placeholder="Brief bio..." 
                                className="min-h-[60px]" 
                                value={member.bio}
                                onChange={(e) => {
                                    const newStaff = [...businessData.staff];
                                    newStaff[index].bio = e.target.value;
                                    setBusinessData(prev => ({ ...prev, staff: newStaff }));
                                }}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                const newStaff = businessData.staff.filter((_, i) => i !== index);
                                setBusinessData(prev => ({ ...prev, staff: newStaff }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {businessData.staff.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No team members added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Schedule & Availability</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Working Hours</h4>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <Label>{day}</Label>
                      </div>
                      <Switch 
                        checked={businessData.workingHours[day]?.open}
                        onCheckedChange={(checked) => {
                          setBusinessData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [day]: { ...prev.workingHours[day], open: checked }
                            }
                          }));
                        }}
                      />
                      <Input 
                        value={businessData.workingHours[day]?.start}
                        onChange={(e) => {
                          setBusinessData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [day]: { ...prev.workingHours[day], start: e.target.value }
                            }
                          }));
                        }}
                        className="w-24" 
                        disabled={!businessData.workingHours[day]?.open}
                      />
                      <span>to</span>
                      <Input 
                        value={businessData.workingHours[day]?.end}
                         onChange={(e) => {
                          setBusinessData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [day]: { ...prev.workingHours[day], end: e.target.value }
                            }
                          }));
                        }}
                        className="w-24"
                        disabled={!businessData.workingHours[day]?.open}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Booking Settings</h4>
                    <div className="space-y-2">
                      <Label>Break between bookings (minutes)</Label>
                      <Input 
                        type="number" 
                        value={businessData.breakTime}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Book ahead limit (days)</Label>
                      <Input 
                        type="number" 
                        value={businessData.bookAhead}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, bookAhead: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Setup Your Business</CardTitle>
                <CardDescription>
                  Complete your profile to start receiving automated bookings
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          
          <CardContent>
            {renderStep()}
          </CardContent>
          
          <div className="flex justify-between p-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}