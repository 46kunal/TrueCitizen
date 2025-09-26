import { useState, useEffect } from "react";
import { Camera, ImagePlus, MapPin, ArrowLeft, Bell, Plus, Map } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { supabase } from "@/supabase";
import imageCompression from 'browser-image-compression';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Skeleton } from "../ui/skeleton";

const categories = [
  "road",
  "garbage",
  "streetlight",
  "water",
  "other",
];

const containerStyle = {
  width: '100%',
  height: '240px',
  borderRadius: '8px'
};

const MapView = ({ location, setLocation, isLoaded }: { location: { lat: number, lng: number } | null, setLocation: (loc: { lat: number, lng: number }) => void, isLoaded: boolean }) => {
  const center = location || { lat: 18.5204, lng: 73.8567 }; // Default to Pune, India

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  if (!isLoaded) {
    return <Skeleton className="h-60 w-full rounded-lg" />;
  }
  
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onClick={handleMapClick}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {location && <MarkerF position={location} />}
      </GoogleMap>
    </div>
  );
};


export const ReportScreen = ({ onNavigate }: { onNavigate?: (tab: string) => void; }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true); // New loading state for user
  const [isMapView, setIsMapView] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const getUser = async () => {
      setIsUserLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setIsUserLoading(false);
    };
    getUser();
  }, []);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    try {
      const compressedFile = await imageCompression(file, options);
      setSelectedImage(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('Error compressing image:', error);
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsMapView(true); // Switch to map view after getting initial location
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsMapView(true); // Fallback to map view
        }
      );
    } else {
      alert("Geolocation is not supported by this browser. Switching to map view.");
      setIsMapView(true);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !category || !description || !location) {
      alert("Please fill out all fields, add an image, and detect your location.");
      return;
    }
    setIsSubmitting(true);

    let imageUrl = null;
    if (selectedImage) {
      const fileName = `${userId}/${Date.now()}_${selectedImage.name}`;
      // Corrected the bucket name to 'issue_images'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        alert("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from('issues').insert({
      user_id: userId,
      title: description.slice(0, 40),
      description: description,
      category: category,
      image_url: imageUrl,
      location_lat: location.lat,
      location_long: location.lng,
      status: 'pending',
    });

    setIsSubmitting(false);

    if (insertError) {
      console.error("Error submitting issue:", insertError.message);
      alert("Failed to submit issue. Please try again.");
    } else {
      alert("Issue reported successfully!");
      onNavigate?.('home');
    }
  };

  if (isUserLoading) {
      return (
        <div className="min-h-screen gradient-background flex items-center justify-center p-6">
            <p>Loading user data...</p>
        </div>
      );
  }

  if (!userId) {
      return (
          <div className="min-h-screen gradient-background flex flex-col items-center justify-center p-6 text-center">
              <p className="mb-4">You must be logged in to report an issue.</p>
              <Button onClick={() => onNavigate?.('auth')}>Go to Login</Button>
          </div>
      );
  }

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-4 pt-6 pb-4 bg-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onNavigate?.('home')}><ArrowLeft className="h-6 w-6" /></Button>
            <h1 className="text-xl font-bold text-foreground">Report</h1>
          </div>
          <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Report an Issue</h2>
        <p className="text-muted-foreground">Help improve your community!</p>

        <div className="bg-white/70 p-4 rounded-lg">
          <Label className="font-semibold mb-2 block">Upload Image for evidence</Label>
          {imagePreview ? (
            <div className="relative w-full h-40">
                <img src={imagePreview} alt="Issue Preview" className="w-full h-full object-cover rounded-lg"/>
                <Button onClick={() => {setImagePreview(null); setSelectedImage(null);}} variant="secondary" size="sm" className="absolute top-2 right-2">Change</Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label htmlFor="camera-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"><Camera className="h-8 w-8"/></div>
                  <span className="text-xs">Add Photo</span>
                </div>
                <input id="camera-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
              </label>
              <label htmlFor="gallery-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"><ImagePlus className="h-8 w-8"/></div>
                  <span className="text-xs">Upload photo</span>
                </div>
                <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Location</Label>
          <div className="relative">
            <Input readOnly value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "No location set"} className="bg-white pr-10"/>
            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setIsMapView(!isMapView)}>
              <Map className="h-5 w-5 text-muted-foreground"/>
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleGetLocation}>
                <MapPin className="h-4 w-4 mr-2"/> Use Current Location
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsMapView(true)}>
                <Map className="h-4 w-4 mr-2"/> Pick on Map
            </Button>
          </div>
        </div>

        {isMapView && (
            <div className="w-full h-auto rounded-lg overflow-hidden">
                <MapView location={location} setLocation={setLocation} isLoaded={isLoaded} />
            </div>
        )}

        <div className="space-y-2">
          <Label className="font-semibold">Category</Label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Description</Label>
          <Textarea
            placeholder="Max 200 Characters"
            maxLength={200}
            rows={4}
            className="resize-none bg-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-lg font-bold rounded-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};
