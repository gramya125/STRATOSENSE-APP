import { motion } from "framer-motion";
import { MapPin, Bell, User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Stratosense experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Location Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/20">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Location</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-foreground mb-2 block">
                  Current Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  defaultValue="Faridabad, India"
                  className="bg-background"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-detect location</p>
                  <p className="text-sm text-muted-foreground">
                    Use GPS to automatically detect your current location
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Health alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when air quality becomes unhealthy
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Daily forecast</p>
                  <p className="text-sm text-muted-foreground">
                    Receive daily air quality predictions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Pollution spikes</p>
                  <p className="text-sm text-muted-foreground">
                    Alert me when pollution levels suddenly increase
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Health Profile</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Respiratory conditions</p>
                  <p className="text-sm text-muted-foreground">
                    I have asthma or other respiratory issues
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Cardiovascular conditions</p>
                  <p className="text-sm text-muted-foreground">
                    I have heart-related health concerns
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sensitive to pollution</p>
                  <p className="text-sm text-muted-foreground">
                    I'm generally sensitive to air pollution
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* App Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/20">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Preferences</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="units" className="text-foreground mb-2 block">
                  Temperature Unit
                </Label>
                <select
                  id="units"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground"
                  defaultValue="celsius"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Show detailed metrics</p>
                  <p className="text-sm text-muted-foreground">
                    Display advanced pollution measurements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Button variant="outline" size="lg">
              Reset to Defaults
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
