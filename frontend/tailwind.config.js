export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0A0E17',
          slate: '#1E293B',
          red: '#EF4444',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          darkCard: '#111827',
          borderDark: '#1F2937',
          borderLight: '#E5E7EB'
        }
      },
      backgroundImage: {
        'login-dark': "url('/src/assets/images/login_bg.png')",
        'login-light': "url('/src/assets/images/login_bg_light.png')",
        'register-dark': "url('/src/assets/images/register_bg.png')",
        'register-light': "url('/src/assets/images/register_bg_light.png')",
        'dashboard-dark': "url('/src/assets/images/dashboard_bg.png')",
        'dashboard-light': "url('/src/assets/images/dashboard_bg_light.png')",
        'redteam-dark': "url('/src/assets/images/red_team_bg.png')",
        'redteam-light': "url('/src/assets/images/red_team_bg_light.png')",
        'blueteam-dark': "url('/src/assets/images/blue_team_bg.png')",
        'blueteam-light': "url('/src/assets/images/blue_team_bg_light.png')",
        'securitytool-dark': "url('/src/assets/images/security_tool_bg.png')",
        'securitytool-light': "url('/src/assets/images/blue_team_bg_light.png')",
        'reports-dark': "url('/src/assets/images/reports_bg.png')",
        'reports-light': "url('/src/assets/images/dashboard_bg_light.png')",
        'history-dark': "url('/src/assets/images/history_bg.png')",
        'history-light': "url('/src/assets/images/register_bg_light.png')",
        'profile-dark': "url('/src/assets/images/profile_bg.png')",
        'profile-light': "url('/src/assets/images/login_bg_light.png')",
        'settings-dark': "url('/src/assets/images/settings_bg.png')",
        'settings-light': "url('/src/assets/images/login_bg_light.png')"
      }
    }
  },
  plugins: []
}
