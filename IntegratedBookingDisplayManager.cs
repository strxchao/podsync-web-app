using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class BookingDisplayManager : MonoBehaviour
{
    [Header("PodSync Integration")]
    private string baseUrl = "http://localhost:3002/api/broadcast";
    private bool currentOnAirStatus = false;
    
    [Header("UI Elements - Status Indicators")]
    public GameObject onAirIndicator;
    public GameObject offAirIndicator;
    public Text statusText;
    public Button toggleButton;
    
    [Header("UI Elements - Booking Display")]
    public Text currentBookingText;
    public Text bookingTimeText;
    public Text bookerNameText;
    public GameObject bookingInfoPanel;
    public Text nextBookingText;
    
    [Header("Settings")]
    public float statusCheckInterval = 30f;
    public bool enableAutoStatusCheck = true;
    
    void Start()
    {
        // Initialize UI
        InitializeUI();
        
        // Start status checking if enabled
        if (enableAutoStatusCheck)
        {
            InvokeRepeating("CheckBroadcastStatus", 0f, statusCheckInterval);
        }
        
        // Setup button listener
        if (toggleButton != null)
        {
            toggleButton.onClick.AddListener(OnToggleButtonPressed);
        }
    }
    
    private void InitializeUI()
    {
        // Set initial state
        UpdateStatusIndicators(false, "Checking status...");
        UpdateBookingDisplay(null);
    }
    
    #region PodSync Integration Methods
    
    // Get status and schedule from PodSync
    public void CheckBroadcastStatus()
    {
        StartCoroutine(GetBroadcastStatusAndSchedule());
    }
    
    IEnumerator GetBroadcastStatusAndSchedule()
    {
        // Get broadcast status
        yield return StartCoroutine(GetBroadcastStatus());
        
        // Get schedule information for booking display
        yield return StartCoroutine(GetScheduleInfo());
    }
    
    IEnumerator GetBroadcastStatus()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(baseUrl + "/unity/status"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                BroadcastStatusResponse response = JsonUtility.FromJson<BroadcastStatusResponse>(request.downloadHandler.text);
                
                // Update status indicators (centralized control)
                UpdateStatusIndicators(response.onAir, response.message);
                currentOnAirStatus = response.onAir;
            }
            else
            {
                Debug.LogError("Failed to get broadcast status: " + request.error);
                UpdateStatusIndicators(false, "Connection Error");
            }
        }
    }
    
    IEnumerator GetScheduleInfo()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(baseUrl + "/schedule"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                ScheduleResponse response = JsonUtility.FromJson<ScheduleResponse>(request.downloadHandler.text);
                
                // Update booking display with schedule information
                UpdateBookingDisplay(response.current_schedule);
            }
            else
            {
                Debug.LogWarning("Failed to get schedule info: " + request.error);
                UpdateBookingDisplay(null);
            }
        }
    }
    
    // Update status to PodSync
    public void SetBroadcastStatus(bool onAir)
    {
        StartCoroutine(UpdateBroadcastStatus(onAir));
    }
    
    IEnumerator UpdateBroadcastStatus(bool onAir)
    {
        BroadcastUpdateRequest data = new BroadcastUpdateRequest();
        data.onAir = onAir;
        data.source = "unity-booking-display";
        
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
                
                // Immediately update UI to provide feedback
                UpdateStatusIndicators(onAir, onAir ? "Going On Air..." : "Going Off Air...");
            }
            else
            {
                Debug.LogError("Failed to update broadcast status: " + request.error);
            }
        }
    }
    
    #endregion
    
    #region UI Update Methods - Centralized Control
    
    // Centralized method to update status indicators (prevents conflicts)
    private void UpdateStatusIndicators(bool onAir, string message)
    {
        // Update status indicators
        if (onAirIndicator != null)
            onAirIndicator.SetActive(onAir);
            
        if (offAirIndicator != null)
            offAirIndicator.SetActive(!onAir);
            
        if (statusText != null)
            statusText.text = message;
            
        // Update toggle button appearance if needed
        if (toggleButton != null)
        {
            ColorBlock colors = toggleButton.colors;
            colors.normalColor = onAir ? Color.red : Color.green;
            toggleButton.colors = colors;
        }
        
        Debug.Log($"Status Updated: {(onAir ? "ON AIR" : "OFF AIR")} - {message}");
    }
    
    // Update booking display with current schedule information
    private void UpdateBookingDisplay(CurrentSchedule schedule)
    {
        if (schedule != null && !string.IsNullOrEmpty(schedule.title))
        {
            // Show booking information
            if (bookingInfoPanel != null)
                bookingInfoPanel.SetActive(true);
                
            if (currentBookingText != null)
                currentBookingText.text = schedule.title;
                
            if (bookingTimeText != null)
                bookingTimeText.text = $"{schedule.start_time} - {schedule.end_time}";
                
            if (bookerNameText != null && !string.IsNullOrEmpty(schedule.peminjam))
                bookerNameText.text = $"Booked by: {schedule.peminjam}";
        }
        else
        {
            // No active booking
            if (bookingInfoPanel != null)
                bookingInfoPanel.SetActive(false);
                
            if (currentBookingText != null)
                currentBookingText.text = "No Active Booking";
                
            if (bookingTimeText != null)
                bookingTimeText.text = "";
                
            if (bookerNameText != null)
                bookerNameText.text = "";
        }
    }
    
    #endregion
    
    #region Event Handlers
    
    // Event handler for toggle button
    public void OnToggleButtonPressed()
    {
        bool newStatus = !currentOnAirStatus;
        SetBroadcastStatus(newStatus);
        
        // Provide immediate UI feedback
        UpdateStatusIndicators(newStatus, newStatus ? "Switching On Air..." : "Switching Off Air...");
    }
    
    // Public method to manually refresh status
    public void RefreshStatus()
    {
        CheckBroadcastStatus();
    }
    
    // Public method to toggle auto-refresh
    public void SetAutoRefresh(bool enabled)
    {
        enableAutoStatusCheck = enabled;
        
        if (enabled)
        {
            InvokeRepeating("CheckBroadcastStatus", 0f, statusCheckInterval);
        }
        else
        {
            CancelInvoke("CheckBroadcastStatus");
        }
    }
    
    #endregion
}

#region Data Classes

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

[System.Serializable]
public class ScheduleResponse
{
    public string timestamp;
    public string wib_time;
    public CurrentSchedule current_schedule;
    public AutoRecommendation auto_recommendation;
}

[System.Serializable]
public class CurrentSchedule
{
    public int id;
    public string title;
    public string peminjam;
    public string start_time;
    public string end_time;
    public bool should_be_on_air;
}

[System.Serializable]
public class AutoRecommendation
{
    public bool should_be_on_air;
    public string reason;
}

#endregion