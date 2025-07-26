import React, { useState, useRef } from 'react';
import { useClassifyWasteImage, useSubmitWasteItem, useWasteCategories } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, CheckCircle, Recycle } from 'lucide-react';

const WasteScanner = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [classification, setClassification] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState({
    weight: '',
    quantity: '1',
    categoryName: '',
  });
  const [step, setStep] = useState<'capture' | 'classify' | 'submit' | 'success'>('capture');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: wasteCategories } = useWasteCategories();
  const classifyMutation = useClassifyWasteImage();
  const submitMutation = useSubmitWasteItem();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setStep('classify');
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) return;

    try {
      // In a real implementation, you would upload the image first
      // For now, we'll simulate the classification
      const result = await classifyMutation.mutateAsync(imagePreview);
      setClassification(result);
      setSubmissionData({
        ...submissionData,
        categoryName: result.predictedCategory,
      });
      setStep('submit');
    } catch (error) {
      console.error('Classification failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!classification || !submissionData.weight) return;

    try {
      await submitMutation.mutateAsync({
        categoryName: submissionData.categoryName,
        weight: parseFloat(submissionData.weight),
        quantity: parseInt(submissionData.quantity),
        imageUrl: imagePreview,
        aiClassification: classification.predictions,
        aiConfidence: classification.confidence,
      });
      setStep('success');
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImagePreview('');
    setClassification(null);
    setSubmissionData({ weight: '', quantity: '1', categoryName: '' });
    setStep('capture');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Waste Scanner</span>
          </CardTitle>
          <CardDescription>
            Take a photo of your waste item to classify and submit for recycling
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Capture Image */}
          {step === 'capture' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Take a photo or upload an image of your waste item</p>
                <div className="space-y-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Classify Image */}
          {step === 'classify' && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Selected waste item"
                  className="max-w-full h-64 object-cover rounded-lg mx-auto"
                />
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-600">Ready to classify this waste item?</p>
                <div className="flex space-x-2 justify-center">
                  <Button variant="outline" onClick={resetScanner}>
                    Retake Photo
                  </Button>
                  <Button 
                    onClick={handleClassify}
                    disabled={classifyMutation.isPending}
                  >
                    {classifyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Classifying...
                      </>
                    ) : (
                      'Classify Item'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Submit Details */}
          {step === 'submit' && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Classified waste item"
                  className="max-w-full h-48 object-cover rounded-lg mx-auto"
                />
              </div>

              {classification && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI Classification: <strong>{classification.predictedCategory}</strong> 
                    {' '}(Confidence: {Math.round(classification.confidence * 100)}%)
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={submissionData.categoryName} 
                    onValueChange={(value) => setSubmissionData({...submissionData, categoryName: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {wasteCategories?.map((category: any) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={submissionData.weight}
                    onChange={(e) => setSubmissionData({...submissionData, weight: e.target.value})}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={submissionData.quantity}
                    onChange={(e) => setSubmissionData({...submissionData, quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex space-x-2 justify-center">
                <Button variant="outline" onClick={() => setStep('classify')}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!submissionData.weight || !submissionData.categoryName || submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit for Recycling'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-800">Successfully Submitted!</h3>
                <p className="text-gray-600">Your waste item has been recorded and points have been added to your account.</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-4">
                  <Badge variant="secondary">
                    +{Math.round(parseFloat(submissionData.weight) * 10)} points
                  </Badge>
                  <Badge variant="secondary">
                    {submissionData.weight}kg recycled
                  </Badge>
                </div>
              </div>

              <Button onClick={resetScanner} className="w-full">
                <Recycle className="h-4 w-4 mr-2" />
                Scan Another Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WasteScanner;
