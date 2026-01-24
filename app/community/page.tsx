"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./CommunityHub.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Discussion {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  tags: string[] | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface Event {
  id: string;
  type_of: string;
  title: string;
  description: string;
  link: string;
  expiry_date_for_registration: string;
  event_date: string;
  location: string;
  registered_count: number;
  status: string;
}

interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  expiry_date: string;
  total_votes: number;
  created_at: string;
  status: string;
}

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  comment_by: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"discussions" | "events" | "polls">("discussions");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // Stats
  const [membersCount, setMembersCount] = useState(0);
  const [activeDiscussionsCount, setActiveDiscussionsCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);

  // Create Discussion Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  // Comments Modal
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Create Event Modal
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type_of: "Webinar",
    title: "",
    description: "",
    link: "",
    expiry_date_for_registration: "",
    event_date: "",
    location: "",
  });

  // Create Poll Modal
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    expiry_date: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAllData();
      fetchUserLikes();
      fetchUserVotes();
    } else {
      fetchStats();
      fetchAllData();
    }
  }, [user]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin || false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("discussion_likes")
      .select("discussion_id")
      .eq("user_id", user.id);
    
    if (data) {
      setUserLikes(new Set(data.map(like => like.discussion_id)));
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("poll_votes")
      .select("poll_id")
      .eq("user_id", user.id);
    
    if (data) {
      setUserVotes(new Set(data.map(vote => vote.poll_id)));
    }
  };

  const fetchStats = async () => {
    const { count: members } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    const { count: activeDiscussions } = await supabase
      .from("discussions")
      .select("*", { count: "exact", head: true });
    
    const { count: upcomingEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("event_date", new Date().toISOString());

    setMembersCount(members || 0);
    setActiveDiscussionsCount(activeDiscussions || 0);
    setUpcomingEventsCount(upcomingEvents || 0);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDiscussions(), fetchEvents(), fetchPolls()]);
    setLoading(false);
  };

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from("discussions")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching discussions:", error);
    } else {
      setDiscussions(data || []);
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("event_date", { ascending: true });
    setEvents(data || []);
  };

  const fetchPolls = async () => {
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching polls:", error);
    } else {
      setPolls(data || []);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user || !newDiscussion.title || !newDiscussion.description) return;

    const { error } = await supabase.from("discussions").insert({
      title: newDiscussion.title,
      description: newDiscussion.description,
      tags: newDiscussion.tags.length > 0 ? newDiscussion.tags : null,
      created_by: user.id,
    });

    if (error) {
      console.error("Error creating discussion:", error);
      alert("Failed to create discussion");
    } else {
      setShowCreateModal(false);
      setNewDiscussion({ title: "", description: "", tags: [] });
      await fetchDiscussions();
      await fetchStats();
    }
  };

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title || !newEvent.description) {
      alert("Please fill in all required fields");
      return;
    }

    const { error } = await supabase.from("events").insert({
      ...newEvent,
      created_by: user.id,
      status: "pending",
    });

    if (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } else {
      setShowCreateEventModal(false);
      setNewEvent({
        type_of: "Webinar",
        title: "",
        description: "",
        link: "",
        expiry_date_for_registration: "",
        event_date: "",
        location: "",
      });
      alert("Event submitted for admin approval! You won't receive a notification if it's rejected.");
    }
  };

  const handleCreatePoll = async () => {
    if (!user || !newPoll.question) {
      alert("Please fill in all required fields");
      return;
    }

    const filteredOptions = newPoll.options.filter((opt) => opt.trim() !== "");
    
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    const pollOptions = filteredOptions.map((opt, idx) => ({
      id: `opt${idx + 1}`,
      text: opt,
      votes: 0,
    }));

    const { error } = await supabase.from("polls").insert({
      question: newPoll.question,
      options: pollOptions,
      expiry_date: newPoll.expiry_date,
      created_by: user.id,
      status: "pending",
    });

    if (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll");
    } else {
      setShowCreatePollModal(false);
      setNewPoll({
        question: "",
        options: ["", ""],
        expiry_date: "",
      });
      alert("Poll submitted for admin approval! You won't receive a notification if it's rejected.");
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    if (!user) {
      alert("Please sign in to like discussions");
      return;
    }

    const isLiked = userLikes.has(discussionId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("discussion_likes")
          .delete()
          .eq("discussion_id", discussionId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error unliking:", error);
          alert("Failed to unlike discussion");
          return;
        }

        const newLikes = new Set(userLikes);
        newLikes.delete(discussionId);
        setUserLikes(newLikes);
      } else {
        const { error } = await supabase
          .from("discussion_likes")
          .insert({
            discussion_id: discussionId,
            user_id: user.id,
          });

        if (error) {
          console.error("Error liking:", error);
          alert("Failed to like discussion");
          return;
        }

        const newLikes = new Set(userLikes);
        newLikes.add(discussionId);
        setUserLikes(newLikes);
      }

      await fetchDiscussions();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred");
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!isAdmin && discussions.find(d => d.id === discussionId)?.created_by !== user?.id) return;

    if (confirm("Are you sure you want to delete this discussion?")) {
      const { error } = await supabase.from("discussions").delete().eq("id", discussionId);
      
      if (error) {
        console.error("Error deleting discussion:", error);
        alert("Failed to delete discussion");
      } else {
        await fetchDiscussions();
        await fetchStats();
      }
    }
  };

  const handleOpenComments = async (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setShowCommentsModal(true);
    
    const { data } = await supabase
      .from("disc_comments")
      .select("*, profiles(full_name, avatar_url)")
      .eq("discussion_id", discussion.id)
      .order("created_at", { ascending: true });
    
    setComments(data || []);
  };

  const handleAddComment = async () => {
    if (!user || !selectedDiscussion || !newComment.trim()) return;

    const { error } = await supabase.from("disc_comments").insert({
      discussion_id: selectedDiscussion.id,
      comment_by: user.id,
      comment_text: newComment.trim(),
    });

    if (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } else {
      setNewComment("");
      await handleOpenComments(selectedDiscussion);
      await fetchDiscussions();
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    if (!user) {
      alert("Please sign in to vote");
      return;
    }

    if (userVotes.has(pollId)) {
      alert("You have already voted on this poll");
      return;
    }

    try {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: user.id,
        option_selected: optionId,
      });

      if (error) {
        console.error("Vote error:", error);
        if (error.code === "23505") {
          alert("You have already voted on this poll");
        } else {
          alert("Failed to vote: " + error.message);
        }
        return;
      }

      const newVotes = new Set(userVotes);
      newVotes.add(pollId);
      setUserVotes(newVotes);

      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchPolls();
      
      alert("Vote recorded successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred while voting");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newDiscussion.tags.includes(tagInput.trim())) {
      setNewDiscussion({
        ...newDiscussion,
        tags: [...newDiscussion.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNewDiscussion({
      ...newDiscussion,
      tags: newDiscussion.tags.filter((t) => t !== tag),
    });
  };

  const addPollOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, ""],
    });
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index),
      });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: newOptions,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading Community Hub...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Community Hub</h1>
        <p className={styles.subtitle}>
          Connect, discuss, and collaborate with legal scholars worldwide
        </p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{membersCount}</span>
            <span className={styles.statLabel}>Members</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{activeDiscussionsCount}</span>
            <span className={styles.statLabel}>Active Discussions</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{upcomingEventsCount}</span>
            <span className={styles.statLabel}>Upcoming Events</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === "discussions" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("discussions")}
        >
          Discussions
        </button>
        <button
          className={`${styles.tab} ${activeTab === "events" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
        <button
          className={`${styles.tab} ${activeTab === "polls" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("polls")}
        >
          Polls
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Discussions Tab */}
        {activeTab === "discussions" && (
          <div className={styles.discussionsContainer}>
            {user && (
              <button
                className={styles.createBtn}
                onClick={() => setShowCreateModal(true)}
              >
                + Start a Discussion
              </button>
            )}

            <div className={styles.discussionsList}>
              {discussions.map((discussion) => {
                const isLiked = userLikes.has(discussion.id);
                
                return (
                  <div key={discussion.id} className={styles.discussionCard}>
                    <div className={styles.discussionHeader}>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          {discussion.profiles?.avatar_url ? (
                            <img src={discussion.profiles.avatar_url} alt="" />
                          ) : (
                            <span>{getInitials(discussion.profiles?.full_name || "A")}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={styles.userName}>
                            {discussion.profiles?.full_name || "Anonymous"}
                          </h3>
                          <p className={styles.timestamp}>
                            {formatDate(discussion.created_at)}
                          </p>
                        </div>
                      </div>
                      {(isAdmin || discussion.created_by === user?.id) && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <h2 className={styles.discussionTitle}>{discussion.title}</h2>
                    <p className={styles.discussionDescription}>
                      {discussion.description}
                    </p>

                    {discussion.tags && discussion.tags.length > 0 && (
                      <div className={styles.tags}>
                        {discussion.tags.map((tag, idx) => (
                          <span key={idx} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.discussionFooter}>
                      <button
                        className={`${styles.actionBtn} ${isLiked ? styles.actionBtnActive : ''}`}
                        onClick={() => handleLikeDiscussion(discussion.id)}
                        disabled={!user}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        {discussion.likes_count}
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleOpenComments(discussion)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {discussion.comments_count} replies
                      </button>
                    </div>
                  </div>
                );
              })}

              {discussions.length === 0 && (
                <p className={styles.noData}>No discussions yet. Start one!</p>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className={styles.eventsContainer}>
            {user && (
              <button
                className={styles.createBtn}
                onClick={() => setShowCreateEventModal(true)}
              >
                + Create an Event
              </button>
            )}

            <div className={styles.eventsList}>
              {events.map((event) => {
                const dateInfo = formatEventDate(event.event_date);
                const isExpired = new Date(event.expiry_date_for_registration) < new Date();
                
                return (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventDateBadge}>
                      <div className={styles.eventDay}>{dateInfo.day}</div>
                      <div className={styles.eventMonth}>{dateInfo.month}</div>
                    </div>

                    <div className={styles.eventContent}>
                      <div className={styles.eventType}>{event.type_of}</div>
                      <h2 className={styles.eventTitle}>{event.title}</h2>
                      <p className={styles.eventDescription}>{event.description}</p>

                      <div className={styles.eventMeta}>
                        <div className={styles.eventInfo}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {formatDate(event.event_date)} • {event.location}
                        </div>
                      </div>

                      {!isExpired ? (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.registerBtn}
                        >
                          Know More
                        </a>
                      ) : (
                        <button className={styles.expiredBtn} disabled>
                          Registration Closed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && (
                <p className={styles.noData}>No upcoming events at the moment.</p>
              )}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === "polls" && (
          <div className={styles.pollsContainer}>
            {user && (
              <button
                className={styles.createBtn}
                onClick={() => setShowCreatePollModal(true)}
              >
                + Create a Poll
              </button>
            )}

            <div className={styles.pollsList}>
              {polls.map((poll) => {
                const isExpired = new Date(poll.expiry_date) < new Date();
                const hasVoted = userVotes.has(poll.id);
                
                return (
                  <div key={poll.id} className={styles.pollCard}>
                    <h2 className={styles.pollQuestion}>{poll.question}</h2>
                    <p className={styles.pollMeta}>
                      {poll.total_votes} votes • Expires {formatDate(poll.expiry_date)}
                      {hasVoted && <span style={{color: '#10b981', marginLeft: '8px'}}>✓ You voted</span>}
                    </p>

                    <div className={styles.pollOptions}>
                      {poll.options.map((option) => {
                        const percentage = poll.total_votes > 0
                          ? ((option.votes / poll.total_votes) * 100).toFixed(1)
                          : "0";

                        return (
                          <button
                            key={option.id}
                            className={styles.pollOption}
                            onClick={() => !isExpired && !hasVoted && handleVotePoll(poll.id, option.id)}
                            disabled={isExpired || !user || hasVoted}
                          >
                            <div className={styles.pollOptionText}>{option.text}</div>
                            <div className={styles.pollOptionStats}>
                              <div
                                className={styles.pollProgress}
                                style={{ width: `${percentage}%` }}
                              />
                              <span className={styles.pollPercentage}>{percentage}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isExpired && (
                      <p className={styles.pollExpired}>This poll has ended</p>
                    )}
                    {!user && !isExpired && (
                      <p className={styles.pollExpired}>Sign in to vote</p>
                    )}
                  </div>
                );
              })}

              {polls.length === 0 && (
                <p className={styles.noData}>No polls available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Start a Discussion</h2>
            
            <input
              type="text"
              placeholder="Discussion Title"
              className={styles.input}
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, title: e.target.value })
              }
            />

            <textarea
              placeholder="What would you like to discuss?"
              className={styles.textarea}
              value={newDiscussion.description}
              onChange={(e) =>
                setNewDiscussion({ ...newDiscussion, description: e.target.value })
              }
              rows={6}
            />

            <div className={styles.tagSection}>
              <div className={styles.tagInputWrapper}>
                <input
                  type="text"
                  placeholder="Add tags (e.g., Constitutional Law)"
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <button onClick={addTag} className={styles.addTagBtn}>
                  Add
                </button>
              </div>
              
              {newDiscussion.tags.length > 0 && (
                <div className={styles.selectedTags}>
                  {newDiscussion.tags.map((tag, idx) => (
                    <span key={idx} className={styles.selectedTag}>
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleCreateDiscussion}>
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className={styles.modal} onClick={() => setShowCreateEventModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Create New Event</h2>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Event Type
              </label>
              <select
                value={newEvent.type_of}
                onChange={(e) => setNewEvent({ ...newEvent, type_of: e.target.value })}
                className={styles.input}
              >
                <option value="Webinar">Webinar</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Event Title"
              className={styles.input}
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />

            <textarea
              placeholder="Event Description"
              className={styles.textarea}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={4}
            />

            <input
              type="url"
              placeholder="Registration Link (https://...)"
              className={styles.input}
              value={newEvent.link}
              onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
            />

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem" }}>
                Event Date
              </label>
              <input
                type="datetime-local"
                className={styles.input}
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem" }}>
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                className={styles.input}
                value={newEvent.expiry_date_for_registration}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, expiry_date_for_registration: e.target.value })
                }
              />
            </div>

            <input
              type="text"
              placeholder="Location (Online or Physical)"
              className={styles.input}
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreateEventModal(false)}
              >
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleCreateEvent}>
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreatePollModal && (
        <div className={styles.modal} onClick={() => setShowCreatePollModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Create New Poll</h2>
            
            <input
              type="text"
              placeholder="Poll Question"
              className={styles.input}
              value={newPoll.question}
              onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            />

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Poll Options
              </label>
              {newPoll.options.map((option, index) => (
                <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={styles.input}
                    style={{ marginBottom: 0 }}
                  />
                  {newPoll.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePollOption(index)}
                      className={styles.deleteBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPollOption}
                className={styles.addTagBtn}
                style={{ marginTop: "0.5rem" }}
              >
                + Add Option
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.875rem" }}>
                Poll Expiry Date
              </label>
              <input
                type="datetime-local"
                className={styles.input}
                value={newPoll.expiry_date}
                onChange={(e) => setNewPoll({ ...newPoll, expiry_date: e.target.value })}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreatePollModal(false)}
              >
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleCreatePoll}>
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedDiscussion && (
        <div className={styles.modal} onClick={() => setShowCommentsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{selectedDiscussion.title}</h2>
            
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <div className={styles.avatar}>
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="" />
                      ) : (
                        <span>{getInitials(comment.profiles?.full_name || "A")}</span>
                      )}
                    </div>
                    <div>
                      <span className={styles.commentAuthor}>
                        {comment.profiles?.full_name || "Anonymous"}
                      </span>
                      <span className={styles.commentTime}>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className={styles.commentText}>{comment.comment_text}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className={styles.noComments}>No comments yet. Be the first!</p>
              )}
            </div>

            {user && (
              <div className={styles.commentInput}>
                <textarea
                  placeholder="Write a reply..."
                  className={styles.commentTextarea}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <button className={styles.submitCommentBtn} onClick={handleAddComment}>
                  Post Reply
                </button>
              </div>
            )}

            <button
              className={styles.closeModalBtn}
              onClick={() => setShowCommentsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;