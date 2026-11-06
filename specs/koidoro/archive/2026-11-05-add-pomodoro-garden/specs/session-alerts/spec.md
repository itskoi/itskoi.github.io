# Spec Delta

## Purpose

Makes sure the user finds out that a session has ended, even when they are working in another tab or application.

## ADDED Requirements

### Requirement: Alert when a session ends
The system SHALL play the chosen sound and show a browser notification naming the next session kind when a session reaches its end time while the app is open.

#### Scenario: Work session ends in a background tab
- **GIVEN** notification permission is granted and the app is in a background tab
- **WHEN** a Work session reaches its end time
- **THEN** a notification names the next session kind and a sound plays, within a few seconds of the end time

#### Scenario: Break ends
- **WHEN** a Break or Long break reaches its end time
- **THEN** the same alert is given, naming Work as the next session

### Requirement: Sounds tell sessions apart
The system SHALL play a soft sound when the user starts a session, and SHALL use a rising chime when Work is next and a falling chime when a Break or Long break is next.

#### Scenario: Starting a session
- **WHEN** the user starts a session
- **THEN** a soft sound plays

#### Scenario: Break is next
- **WHEN** a Work session reaches its end time
- **THEN** a falling chime plays

#### Scenario: Work is next
- **WHEN** a Break or Long break reaches its end time
- **THEN** a rising chime plays

### Requirement: Only natural endings alert
The system SHALL NOT alert when the user ends a session themselves, or when a session is found to have ended while the app was closed.

#### Scenario: User abandons a session
- **WHEN** the user abandons a Work session or ends a break early
- **THEN** no sound plays and no notification is shown

#### Scenario: App reopened after the end time
- **WHEN** the app is opened after a running session's end time has passed
- **THEN** no sound plays and no notification is shown

### Requirement: Notification permission
The system SHALL ask for notification permission only as a result of the user starting a session, and only if the user has not already answered.

#### Scenario: First start
- **GIVEN** the user has never answered the permission prompt
- **WHEN** the user starts a session
- **THEN** the browser asks for notification permission and the session starts regardless of the answer

#### Scenario: Already answered
- **GIVEN** the user has already allowed or denied notifications
- **WHEN** the user starts a session
- **THEN** no permission prompt appears

### Requirement: Alerts degrade safely
The system SHALL keep the timer working when notifications or sound are denied, unsupported, or fail, and SHALL always show the session's end in the page.

#### Scenario: Notifications denied
- **GIVEN** notification permission is denied
- **WHEN** a session reaches its end time
- **THEN** the sound plays, the page shows the next session, and no error appears

#### Scenario: Sound blocked
- **GIVEN** the browser blocks sound because the page was reloaded with no click since
- **WHEN** a session reaches its end time
- **THEN** the notification is still shown and the page shows the next session
