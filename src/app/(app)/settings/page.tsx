"use client"
import { Settings, User, Bell, Palette, Database, Download, Upload, Keyboard, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/layout/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeetCodeAccountCard } from "@/components/leetcode/leetcode-account"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">Customize your experience</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full flex-wrap h-auto min-h-10 gap-1">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm"><User className="h-3 w-3 sm:h-4 sm:w-4" />Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm"><Palette className="h-3 w-3 sm:h-4 sm:w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="shortcuts" className="hidden sm:inline-flex gap-1 sm:gap-2 text-xs sm:text-sm"><Keyboard className="h-3 w-3 sm:h-4 sm:w-4" />Shortcuts</TabsTrigger>
          <TabsTrigger value="data" className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm"><Database className="h-3 w-3 sm:h-4 sm:w-4" />Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div><Label>Name</Label><Input defaultValue="" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="" className="mt-1" /></div>
              </div>
              <div><Label>Current Role</Label><Input defaultValue="" className="mt-1" /></div>
              <div><Label>Target Companies</Label><Input defaultValue="" className="mt-1" /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { id: "dark" as const, label: "Dark", icon: Moon },
                  { id: "light" as const, label: "Light", icon: Sun },
                  { id: "system" as const, label: "System", icon: Monitor },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`flex items-center sm:flex-col items-center gap-3 sm:gap-2 sm:p-6 p-4 rounded-xl border transition-all ${
                      theme === t.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                    }`}>
                    <t.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Animations", description: "Enable smooth animations", default: true },
                { label: "Sound Effects", description: "Play sounds for achievements", default: false },
                { label: "Compact Mode", description: "Reduce spacing for more content", default: false },
                { label: "Focus Mode", description: "Hide distractions during work", default: false },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch defaultChecked={pref.default} className="shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="hidden sm:block space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Keyboard Shortcuts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { keys: "Ctrl + K", action: "Open Command Palette" },
                { keys: "Ctrl + B", action: "Toggle Sidebar" },
                { keys: "Ctrl + N", action: "New Entry" },
                { keys: "Ctrl + S", action: "Save Current" },
                { keys: "Ctrl + /", action: "Toggle Focus Mode" },
                { keys: "Ctrl + Shift + P", action: "Pomodoro Timer" },
                { keys: "Esc", action: "Close Dialog/Modal" },
                { keys: "?", action: "Show Shortcuts" },
              ].map((shortcut) => (
                <div key={shortcut.action} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent">
                  <span className="text-sm truncate">{shortcut.action}</span>
                  <kbd className="pointer-events-none inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground shrink-0">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <LeetCodeAccountCard />
          <Card>
            <CardHeader><CardTitle className="text-base">Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <Card className="glass-hover cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Download className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Export Data</p>
                      <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-hover cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Import Data</p>
                      <p className="text-xs text-muted-foreground">Import data from a JSON file</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Separator />
              <div className="p-4 rounded-lg border border-red-400/20 bg-red-400/5">
                <p className="text-sm font-medium text-red-400">Danger Zone</p>
                <p className="text-xs text-muted-foreground mt-1">Once you delete your data, it cannot be recovered.</p>
                <Button variant="destructive" size="sm" className="mt-3">Delete All Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
