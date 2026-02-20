# Navbar Notifications — Prototype Reference

All notification types visible in the navbar bell icon, Play tab, and Friends tab.

---

## Clubs

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Club News | Club avatar | `"{clubName}"` | `"Posted news"` | None | Replace |
| Club Note | Club avatar | `"{clubName}"` | `"Has a new Note"` | None | Aggregate |
| Club Forum Topic | Club avatar | `"{clubName}"` | `"Has a new topic"` | None | Aggregate |
| Club Join Request | Club avatar | `"{clubName}"` | `"{username} wants to join"` | Accept (✓) / Decline (✕) | No rollup needed |

---

## Games — Challenges

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Game Seek (Daily) | Challenger's avatar | `"{username}"` | `"Wants to play"` | Accept (✓) / Decline (✕) | No rollup needed |
| Live Challenge | Challenger's avatar | `"{username}"` | `"Wants to play"` | Accept (✓) / Decline (✕) | No rollup needed |

---

## Games — Active Games

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Game Started | Opponent's avatar | `"It's your move!"` | `"Your game with {username} ({rating}) has started!"` | None | No rollup needed |
| Your Move (Daily) | Opponent's avatar | `"It's your move!"` | `"{username} played {move}."` | None | No rollup needed |
| Game Low On Time | Opponent's avatar | *(none)* | `"Your game against {username} is running out of time. Make your move!"` | None | No rollup needed |
| Draw Offered | Opponent's avatar | `"{username}"` | `"Offered a Draw"` | Accept / Decline (in-game) | No rollup needed |
| Chat Message Sent | Opponent's avatar | `"{username} ({rating}) messaged you"` | `"{message content}"` | None | SKIP (same game rollup, no rollup across games) |
| Game Finished | Opponent's avatar | *(dynamic)* | *(dynamic)* | None | No rollup needed |

---

## Games — Competitions

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Team Match | Opponent's avatar | `"Team Match \"{matchName}\" Has Started"` | *(navigates to match)* | None | No rollup needed |
| Tournament Game | Opponent's avatar | *(game update format)* | *(navigates to tournament game)* | None | No rollup needed |
| Team Live Competition | Opponent's avatar | `"{competition name}"` | `"Starts in {time}"` | None | Maybe replace (TBD) |
| Vote Chess Game | Opponent's avatar | `"{game name}"` | `"Has an update"` | None | Needs rollup: `"Votechess game has {n} updates"` |

---

## Social

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| New Comment | Glyph icon (varies by content type) | `"{content title}"` | Comment count (aggregated) | None | Aggregate |
| New Content | Creator's avatar | `"{username}"` | `"Has a new post"` | None | Replace |
| Profile Notes | Sender's avatar | `"{username}"` | *(navigates to profile notes)* | None | Replace (should be aggregate) |
| Friend Request | Requester's avatar | `"{username}"` | `"Wants to be friends"` | Accept (✓) / Decline (✕) | No rollup needed |
| Friend Activity | Friend's avatar | `"{username}"` | `"Has achieved a rating of {rating} in {category}"` | None | TBD |
| Contact Match | Contact's avatar | `"{name} is Now on Chess.com!"` | `"Add {name} as a friend, and challenge them to a game!"` | None | No rollup needed |

---

## Achievements & Rewards

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Achievement | Achievement badge image | `"{achievement name}"` | `"You earned an achievement"` | None | None currently |
| Trophy | Sender's avatar | `"{username}"` | `"Sent you a trophy {trophy name}"` | None | None currently |
| Arena Trophy | Your own avatar | `"{trophy name}"` | `"You earned a trophy"` | None | None currently |

---

## Other

| Notification | Image | Title | Body | Buttons | Rollup |
|---|---|---|---|---|---|
| Insights | Category icon (fallback) | `"Your insights are ready!"` | *(navigates to insights)* | None | None currently |

---

## Quick Reference

### Notifications with inline buttons

| Notification | Location | Buttons |
|---|---|---|
| Club Join Request | Bell dropdown | Accept (✓) / Decline (✕) |
| Game Seek (Daily) | Play tab | Accept (✓) / Decline (✕) |
| Live Challenge | Play tab | Accept (✓) / Decline (✕) |
| Friend Request | Friends tab | Accept (✓) / Decline (✕) |

### Rollup strategies

| Strategy | Meaning | Used by |
|---|---|---|
| **Replace** | New notification replaces the previous one | Club News, New Content, Profile Notes |
| **Aggregate** | Multiple notifications grouped with count | Club Note, Club Forum Topic, New Comment |
| **SKIP** | Prevents duplicates for same source | Chat Message Sent (same game) |
| **No rollup** | Each notification shown individually | Challenges, Game Started, Friend Request, etc. |
| **TBD** | Not yet defined | Team Live Competition, Friend Activity |

### Image types

| Image type | Used by |
|---|---|
| **User avatar** | Challenges, game notifications, social notifications, trophies |
| **Club avatar** | All club notifications |
| **Achievement badge** | Achievement notifications |
| **Glyph icon** | New Comment (icon varies by content type) |
| **Category icon** | Insights (fallback when no image provided) |
