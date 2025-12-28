document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = renderActivityCard(name, details);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Render activity card
  function renderActivityCard(activityName, activity) {
    const card = document.createElement("div");
    card.className = "activity-card";
    card.innerHTML = `
      <h4>${activityName}</h4>
      <p>${activity.description}</p>
      <p><strong>Schedule:</strong> ${activity.schedule}</p>
      <p><strong>Max participants:</strong> ${activity.max_participants}</p>
      <div class="activity-card-participants">
        <h5>Participants:</h5>
        ${
          activity.participants && activity.participants.length > 0
            ? `<ul>${activity.participants.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : '<span style="color:#888;">No participants yet.</span>'
        }
      </div>
    `;
        card.innerHTML = `
          <h4>${activityName}</h4>
          <p>${activity.description}</p>
          <p><strong>Schedule:</strong> ${activity.schedule}</p>
          <p><strong>Max participants:</strong> ${activity.max_participants}</p>
          <div class="activity-card-participants">
            <h5>Participants:</h5>
            ${
              activity.participants && activity.participants.length > 0
                ? `<ul class="participants-list">${activity.participants.map((p) => `<li style='list-style:none;display:flex;align-items:center;gap:6px;'>${p} <span class='delete-participant' title='Remove participant' data-activity="${encodeURIComponent(activityName)}" data-email="${encodeURIComponent(p)}" style='color:#c00;cursor:pointer;font-weight:bold;'>&#10006;</span></li>`).join("")}</ul>`
                : '<span style="color:#888;">No participants yet.</span>'
            }
          </div>
        `;

        // Add event listeners for delete icons
        setTimeout(() => {
          card.querySelectorAll('.delete-participant').forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activityName = decodeURIComponent(icon.getAttribute('data-activity'));
              const email = decodeURIComponent(icon.getAttribute('data-email'));
              if (confirm(`Remove ${email} from ${activityName}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activityName)}/remove?email=${encodeURIComponent(email)}`, { method: 'POST' });
                  if (response.ok) {
                    fetchActivities();
                  } else {
                    const result = await response.json();
                    alert(result.detail || 'Failed to remove participant.');
                  }
                } catch (err) {
                  alert('Error removing participant.');
                }
              }
            });
          });
        }, 0);
    return card;
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // odśwież listę aktywności po udanym zapisie
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
