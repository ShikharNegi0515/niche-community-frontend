import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { apiRequest } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { getCommunityColor, formatRelativeTime } from "../components/utils.js";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("home");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [communitySearch, setCommunitySearch] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoadingCommunities(true);
      const params = communitySearch.trim()
        ? `?search=${encodeURIComponent(communitySearch.trim())}`
        : "";
      const data = await apiRequest(`/api/communities${params}`);
      setCommunities(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingCommunities(false);
    }
  }, [communitySearch, showToast]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const url =
        selectedCommunity === "home"
          ? "/api/posts/feed"
          : `/api/posts?communityId=${selectedCommunity}`;
      const data = await apiRequest(url);
      setPosts(data);
    } catch (err) {
      showToast(err.message, "error");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [selectedCommunity, showToast]);

  useEffect(() => {
    if (user) fetchCommunities();
  }, [user, fetchCommunities]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) fetchCommunities();
    }, 300);
    return () => clearTimeout(timer);
  }, [communitySearch]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || selectedCommunity === "home") {
      showToast("Select a community and fill in title and content.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          communityId: selectedCommunity,
        }),
      });
      setPosts((prev) => [data, ...prev]);
      setTitle("");
      setContent("");
      showToast("Post published!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const joinCommunity = async (id) => {
    try {
      await apiRequest(`/api/communities/${id}/join`, { method: "POST" });
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, members: [...c.members, user.id] } : c
        )
      );
      showToast("Joined community!", "success");
      if (selectedCommunity === id) fetchPosts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const leaveCommunity = async (id) => {
    try {
      await apiRequest(`/api/communities/${id}/leave`, { method: "POST" });
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, members: c.members.filter((m) => m.toString() !== user.id) }
            : c
        )
      );
      showToast("Left community.", "info");
      if (selectedCommunity === id) setSelectedCommunity("home");
      fetchPosts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteCommunity = async (id) => {
    if (!window.confirm("Delete this community and all its posts?")) return;
    try {
      await apiRequest(`/api/communities/${id}`, { method: "DELETE" });
      setCommunities((prev) => prev.filter((c) => c._id !== id));
      if (selectedCommunity === id) setSelectedCommunity("home");
      showToast("Community deleted.", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await apiRequest(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p._id !== id));
      showToast("Post deleted.", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.user?.username?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  const activeCommunityData = communities.find((c) => c._id === selectedCommunity);
  const isMember =
    activeCommunityData?.members?.some((m) => m.toString() === user?.id) ?? false;
  const isCreator =
    activeCommunityData?.creator?._id?.toString() === user?.id ||
    activeCommunityData?.creator?.toString() === user?.id;

  const selectCommunity = (id) => {
    setSelectedCommunity(id);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-page">
      <Navbar refreshCommunities={fetchCommunities} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="dashboard-container">
        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-block">
            <h3>Feeds</h3>
            <ul>
              <li
                className={selectedCommunity === "home" ? "active" : ""}
                onClick={() => selectCommunity("home")}
              >
                <span className="sidebar-name">🏠 Personal Feed</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-block sidebar-scroll">
            <h3>Communities ({communities.length})</h3>
            <input
              type="search"
              className="community-search"
              placeholder="Search communities..."
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
            />
            {loadingCommunities ? (
              <p className="sidebar-hint">Loading...</p>
            ) : (
              <ul>
                {communities.map((c) => {
                  const member = c.members.some((m) => m.toString() === user?.id);
                  const creator =
                    c.creator?._id?.toString() === user?.id ||
                    c.creator?.toString() === user?.id;
                  const isActive = selectedCommunity === c._id;
                  const color = getCommunityColor(c._id);

                  return (
                    <li
                      key={c._id}
                      className={isActive ? "active" : ""}
                      style={
                        isActive
                          ? {
                              background: color.bg,
                              borderColor: color.border,
                              color: color.text,
                            }
                          : {}
                      }
                    >
                      <span
                        className="sidebar-name"
                        onClick={() => selectCommunity(c._id)}
                      >
                        <span
                          className="community-dot"
                          style={{ background: color.dot, boxShadow: `0 0 6px ${color.dot}55` }}
                        />
                        {c.name}
                        <span className="member-count">{c.members.length}</span>
                      </span>
                      <div className="sidebar-actions">
                        {member ? (
                          !creator && (
                            <button
                              type="button"
                              className="sidebar-btn leave"
                              onClick={() => leaveCommunity(c._id)}
                            >
                              Leave
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            className="sidebar-btn join"
                            onClick={() => joinCommunity(c._id)}
                          >
                            Join
                          </button>
                        )}
                        {creator && (
                          <button
                            type="button"
                            className="sidebar-btn delete"
                            onClick={() => deleteCommunity(c._id)}
                            title="Delete community"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="feed-header-section">
            <div>
              <h2>
                {selectedCommunity === "home"
                  ? "Your Personal Feed"
                  : `🪐 ${activeCommunityData?.name || "Community"}`}
              </h2>
              {selectedCommunity !== "home" && activeCommunityData?.description && (
                <p className="feed-subtitle">{activeCommunityData.description}</p>
              )}
            </div>
            <div className="post-search">
              <input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {selectedCommunity !== "home" && isMember && (
            <div className="post-form-panel">
              <h3>✨ Share with {activeCommunityData?.name}</h3>
              <form className="post-form-grid" onSubmit={handlePostSubmit}>
                <input
                  type="text"
                  placeholder="Catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  required
                />
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Posting..." : "Publish post"}
                </button>
              </form>
            </div>
          )}

          {selectedCommunity !== "home" && !isMember && activeCommunityData && (
            <div className="empty-panel">
              <p>Join this community to read and create posts.</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => joinCommunity(activeCommunityData._id)}
              >
                Join {activeCommunityData.name}
              </button>
            </div>
          )}

          {loadingPosts ? (
            <LoadingSpinner label="Loading posts..." />
          ) : (
            <div className="posts-container">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const communityId = post.community?._id || selectedCommunity;
                  const tagColor = getCommunityColor(communityId);
                  const authorId = post.user?._id?.toString() || post.user?.toString();

                  return (
                    <article
                      className="post-card"
                      key={post._id}
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <div className="post-author">
                          <span>
                            👤 <strong>{post.user?.username || "Anonymous"}</strong>
                          </span>
                          <span>•</span>
                          <span>{formatRelativeTime(post.createdAt)}</span>
                        </div>
                        <div className="post-meta-actions">
                          <span
                            className="post-tag"
                            style={{
                              background: tagColor.bg,
                              color: tagColor.text,
                              border: `1px solid ${tagColor.border}`,
                            }}
                          >
                            {post.community?.name || "Community"}
                          </span>
                          {authorId === user?.id && (
                            <button
                              type="button"
                              className="post-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost(post._id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="empty-panel">
                  <span className="empty-icon">📭</span>
                  <p>No posts found in this feed.</p>
                  <p className="empty-hint">
                    {selectedCommunity === "home"
                      ? "Join communities to see posts here."
                      : "Be the first to share something!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
