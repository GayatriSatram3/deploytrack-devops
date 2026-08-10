async function loadInfo() {

    const response = await fetch("/api/info");

    const info = await response.json();

    document.getElementById("application").textContent =
        info.application;

    document.getElementById("environment").textContent =
        info.environment;

    document.getElementById("version").textContent =
        "v" + info.version;
}


async function loadHealth() {

    const response = await fetch("/api/health");

    const health = await response.json();

    document.getElementById("application-status").textContent =
        health.application.status;

    document.getElementById("api-status").textContent =
        health.api.status;

    document.getElementById("server-status").textContent =
        health.server.status;
}


async function loadDeployments() {

    const response = await fetch("/api/deployments");

    if (!response.ok) {
        throw new Error("Failed to load deployments");
    }

    const deployments = await response.json();

    const container = document.getElementById("deployments");

    container.innerHTML = "";

    deployments.forEach(deployment => {

        const div = document.createElement("div");

        div.className = "deployment";

        let statusClass;
        
        if (deployment.status === "SUCCESS") {
            statusClass = "success";
        } else if (deployment.status === "BUILDING") {
            statusClass = "building";
        } else {
            statusClass = "failed";
        }

        div.innerHTML = `
            <span>#${deployment.build}</span>
            <span>${deployment.version}</span>
            <span>${deployment.environment}</span>
            <strong class="${statusClass}">
                ${deployment.status}
            </strong>
        `;

        container.appendChild(div);
    });
}

async function updateDeploymentStatus(build, status) {

    await fetch(`/api/deployments/${build}/status`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status: status
        })
    });
}


async function triggerDeployment() {

    const button = document.getElementById("deploy-button");
    const message = document.getElementById("deploy-message");

    button.disabled = true;
    button.textContent = "Deploying...";

    try {

        const response = await fetch("/api/deploy", {
            method: "POST"
        });

        const result = await response.json();

        message.textContent =
            `🔨 Build #${result.build} started`;

        await loadDeployments();


        // BUILDING → TESTING
        setTimeout(async () => {

            await updateDeploymentStatus(
                result.build,
                "TESTING"
            );

            message.textContent =
                `🧪 Build #${result.build} is being tested`;

            await loadDeployments();

        }, 2000);


        // TESTING → DEPLOYING
        setTimeout(async () => {

            await updateDeploymentStatus(
                result.build,
                "DEPLOYING"
            );

            message.textContent =
                `🚀 Build #${result.build} is being deployed`;

            await loadDeployments();

        }, 4000);


        // DEPLOYING → SUCCESS
        setTimeout(async () => {

            await updateDeploymentStatus(
                result.build,
                "SUCCESS"
            );

            message.textContent =
                `✅ Build #${result.build} completed successfully`;

            await loadDeployments();

            button.disabled = false;
            button.textContent = "🚀 Trigger Deployment";

        }, 6000);


    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ Deployment failed.";

        button.disabled = false;
        button.textContent = "🚀 Trigger Deployment";
    }
}


loadInfo();
loadHealth();
loadDeployments();