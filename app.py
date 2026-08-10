from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# DeployTrack CI/CD webhook test

deployments_data = [
    {
        "build": 4,
        "version": "1.1.0",
        "status": "SUCCESS",
        "environment": "Testing"
    },
    {
        "build": 3,
        "version": "1.0.0",
        "status": "SUCCESS",
        "environment": "Testing"
    },
    {
        "build": 2,
        "version": "0.9.0",
        "status": "SUCCESS",
        "environment": "Testing"
    },
    {
        "build": 1,
        "version": "0.8.0",
        "status": "FAILED",
        "environment": "Testing"
    }
]

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/health")
def health():
    return jsonify({
        "application": {
            "status": "Running",
            "healthy": True
        },
        "api": {
            "status": "Healthy",
            "healthy": True
        },
        "server": {
            "status": "Online",
            "healthy": True
        }
    })


@app.route("/api/info")
def info():
    return jsonify({
        "application": "DeployTrack",
        "environment": "Testing",
        "version": "1.1.0"
    })


@app.route("/api/deployments")
def deployments():
    return jsonify(deployments_data)


@app.route("/api/deploy", methods=["POST"])
def deploy():

    new_build = deployments_data[0]["build"] + 1

    new_version = f"1.0.{new_build - 3}"

    new_deployment = {
        "build": new_build,
        "version": new_version,
        "status": "BUILDING",
        "environment": "Testing"
    }

    deployments_data.insert(0, new_deployment)

    return jsonify({
        "status": "BUILDING",
        "message": "Deployment started",
        "build": new_build,
        "version": new_version
    })

@app.route("/api/deployments/<int:build>/status", methods=["PUT"])
def update_deployment_status(build):

    data = request.get_json()

    new_status = data.get("status")

    for deployment in deployments_data:

        if deployment["build"] == build:

            deployment["status"] = new_status

            return jsonify({
                "message": "Deployment status updated",
                "deployment": deployment
            })

    return jsonify({
        "error": "Deployment not found"
    }), 404



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)