# Sonarr - Google Home Action

### This provides a google home action for Sonarr PVR

#### Functionality
* upcoming

#### Requirements:
* node
* gactions cli [https://developers.google.com/actions/tools/gactions-cli]
* serverless platform (tested on Google Functions but should work on ASM Lambda)

#### Usage:
* Copy sample_creds.json to creds.json and fill in sonarr server creds
* npm install
* Deploy cloud function:
  * `gcloud beta functions deploy sonarrInfo --trigger-http --stage-bucket $BUCKET`
  * Note the  **httpsTrigger**
* Copy sample_action.json to action.json and replace **projectId** and **url**
* Deploy google action:
  * `gactions preview --invocation_name="sonar" --preview_mins 72000`
