# Unity Digital Signage Integration Guide

## 🎯 Overview

Dokumentasi ini menjelaskan cara mengintegrasikan Unity Digital Signage dengan PodSync Web App untuk sinkronisasi status broadcast on-air/off-air.

## 📋 Fitur Integrasi

### 1. Manual Control
- Tombol on/off di web app mengupdate status Unity
- Tombol on/off di Unity mengupdate status web app
- Real-time synchronization antar platform

### 2. Automatic Scheduling
- Status otomatis berubah berdasarkan jadwal lab
- Jam mulai schedule → Auto ON-AIR
- Jam berakhir schedule → Auto OFF-AIR
- Timezone menggunakan WIB (Asia/Jakarta)

## 🔌 API Endpoints untuk Unity

### Base URL
```
http://localhost:3002/api/broadcast
```

### 1. Get Current Status (Unity → PodSync)
```http
GET /api/broadcast/unity/status
```

**Response:**
```json
{
  "onAir": true,
  "message": "On Air: Recording Podcast",
  "lastUpdate": "2025-06-22T10:30:00.000Z",
  "wibTime": "22/06/2025, 17.30.00"
}
```

### 2. Update Status (Unity → PodSync)
```http
POST /api/broadcast/unity/status
Content-Type: application/json

{
  "onAir": true,
  "source": "unity-app"
}
```

**Response:**
```json
{
  "success": true,
  "onAir": true,
  "wibTime": "22/06/2025, 17.30.00"
}
```

### 3. Get Schedule Information
```http
GET /api/broadcast/schedule
```

**Response:**
```json
{
  "timestamp": "2025-06-22T10:30:00.000Z",
  "wib_time": "22/06/2025, 17.30.00",
  "current_schedule": {
    "id": 123,
    "title": "Recording Podcast Episode 1",
    "peminjam": "John Doe",
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "should_be_on_air": true
  },
  "auto_recommendation": {
    "should_be_on_air": true,
    "reason": "Active schedule: Recording Podcast Episode 1"
  }
}
```

## 🎮 Unity Integration Code Examples

### C# HTTP Client untuk Unity

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class PodSyncIntegration : MonoBehaviour
{
    private string baseUrl = "http://localhost:3002/api/broadcast";
    private bool currentOnAirStatus = false;
    
    void Start()
    {
        // Check status setiap 30 detik
        InvokeRepeating("CheckBroadcastStatus", 0f, 30f);
    }
    
    // Get status dari PodSync
    public void CheckBroadcastStatus()
    {
        StartCoroutine(GetBroadcastStatus());
    }
    
    IEnumerator GetBroadcastStatus()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(baseUrl + "/unity/status"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                BroadcastStatusResponse response = JsonUtility.FromJson<BroadcastStatusResponse>(request.downloadHandler.text);
                
                // Update UI Unity
                UpdateOnAirDisplay(response.onAir, response.message);
                currentOnAirStatus = response.onAir;
            }
            else
            {
                Debug.LogError("Failed to get broadcast status: " + request.error);
            }
        }
    }
    
    // Update status ke PodSync
    public void SetBroadcastStatus(bool onAir)
    {
        StartCoroutine(UpdateBroadcastStatus(onAir));
    }
    
    IEnumerator UpdateBroadcastStatus(bool onAir)
    {
        BroadcastUpdateRequest data = new BroadcastUpdateRequest();
        data.onAir = onAir;
        data.source = "unity-digital-signage";
        
        string jsonData = JsonUtility.ToJson(data);
        
        using (UnityWebRequest request = UnityWebRequest.PostWwwForm(baseUrl + "/unity/status", ""))
        {
            byte[] jsonToSend = new System.Text.UTF8Encoding().GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(jsonToSend);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Broadcast status updated successfully");
            }
            else
            {
                Debug.LogError("Failed to update broadcast status: " + request.error);
            }
        }
    }
    
    // Event handler untuk tombol Unity
    public void OnToggleButtonPressed()
    {
        bool newStatus = !currentOnAirStatus;
        SetBroadcastStatus(newStatus);
        
        // Update immediate UI
        UpdateOnAirDisplay(newStatus, newStatus ? "Going On Air..." : "Going Off Air...");
    }
    
    private void UpdateOnAirDisplay(bool onAir, string message)
    {
        // Update your Unity UI here
        // Example:
        // onAirIndicator.SetActive(onAir);
        // statusText.text = message;
        
        Debug.Log($"Broadcast Status: {(onAir ? "ON AIR" : "OFF AIR")} - {message}");
    }
}

[System.Serializable]
public class BroadcastStatusResponse
{
    public bool onAir;
    public string message;
    public string lastUpdate;
    public string wibTime;
}

[System.Serializable]
public class BroadcastUpdateRequest
{
    public bool onAir;
    public string source;
}
```

## ⚙️ Konfigurasi Automatic Scheduler

### Start Automatic Scheduler
```http
POST /api/broadcast/scheduler/start
```

### Stop Automatic Scheduler
```http
POST /api/broadcast/scheduler/stop
```

### Get Scheduler Status
```http
GET /api/broadcast/scheduler/status
```

**Response:**
```json
{
  "running": true,
  "check_interval_seconds": 30,
  "last_check": {
    "time": "2025-06-22T10:30:00.000Z",
    "active_schedule": {
      "id": 123,
      "title": "Recording Session",
      "start_time": "10:00:00",
      "end_time": "12:00:00"
    },
    "should_be_on_air": true,
    "currently_on_air": true,
    "needs_update": false
  }
}
```

## 🕒 Timezone Management

### ✅ Yang Sudah Dikonfigurasi:
- Database timezone: **+07:00 (Jakarta/WIB)**
- Semua schedule comparison menggunakan **waktu lokal WIB**
- API response menggunakan **formatWIBDisplay()** untuk konsistensi

### 📋 Contoh Waktu:
```json
{
  "wib_time": "22/06/2025, 17.30.00",
  "schedule_start": "10:00:00",
  "schedule_end": "12:00:00"
}
```

## 🔄 Sync Logic

### Manual Override Respect
- Manual changes di-respect selama **15 menit**
- Setelah 15 menit, automatic scheduler mengambil alih
- Source tracking: `manual`, `unity`, `auto-scheduler`

### Automatic Schedule Check
- Check setiap **30 detik**
- Logic: Jika ada jadwal aktif → ON-AIR
- Logic: Jika tidak ada jadwal → OFF-AIR

## 🛡️ Error Handling

### Unity Side
```csharp
if (request.result != UnityWebRequest.Result.Success)
{
    // Fallback ke status lokal
    Debug.LogWarning("PodSync connection failed, using local status");
    
    // Optional: Retry dengan exponential backoff
    StartCoroutine(RetryAfterDelay(5f));
}
```

### PodSync Side
- Database connection failure → Continue dengan fallback
- Unity connection timeout → Log warning, continue operation
- Schedule parsing error → Default ke OFF-AIR

## 📊 Testing Endpoints

### Test dari Unity/Browser:
```bash
# Get status
curl http://localhost:3002/api/broadcast/unity/status

# Set ON-AIR
curl -X POST http://localhost:3002/api/broadcast/unity/status \
  -H "Content-Type: application/json" \
  -d '{"onAir": true, "source": "test"}'

# Get schedule info
curl http://localhost:3002/api/broadcast/schedule
```

## 🚀 Implementation Steps

1. **PodSync Web App** ✅
   - Broadcast controller created
   - API endpoints ready
   - Automatic scheduler implemented
   - Timezone handling configured

2. **Unity Digital Signage** (Next Step)
   - Add HTTP client script
   - Create UI toggle button
   - Implement status polling
   - Add visual indicators

3. **Testing**
   - Manual sync test
   - Automatic schedule test
   - Error handling test
   - Performance test

---

**Ready for Unity integration!** 🎮
Silakan berikan path ke project Unity digital signage untuk melanjutkan implementasi.