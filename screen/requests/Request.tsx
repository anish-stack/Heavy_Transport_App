"use client"

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    Image,
    Modal,
    Alert,
} from "react-native"
import { useState, useEffect } from "react"
import { useRoute } from "@react-navigation/native"
import useCallAndMessage from "../../hooks/GetCallAndMessage.hook"
import { AntDesign, Feather, MaterialIcons, FontAwesome } from "@expo/vector-icons"
import { API_URL_APP } from "../../constant/Api"
import axios from "axios"

const ITEMS_PER_PAGE = 10

export default function Request() {
    const route = useRoute()
    const { type } = route.params || { type: "call" } // Default to call if not specified
    const { message, calls, refresh } = useCallAndMessage()

    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [bookmarkedItems, setBookmarkedItems] = useState([])
    const [notedItems, setNotedItems] = useState([])

    // State for note management
    const [noteModalVisible, setNoteModalVisible] = useState(false)
    const [currentItemId, setCurrentItemId] = useState(null)
    const [noteText, setNoteText] = useState("")
    const [notes, setNotes] = useState({})
    const [editingNoteId, setEditingNoteId] = useState(null)
    const [apiLoading, setApiLoading] = useState(false)

    // Determine which data to use based on type
    const data = type === "call" ? calls : message

    useEffect(() => {
        // Initialize bookmarked items from data
        const bookmarked = data?.filter((item) => item.status === "Bookmark").map((item) => item._id) || []
        setBookmarkedItems(bookmarked)

        // Initialize items with notes
        const withNotes =
            data?.filter((item) => item.noteByReciver && item.noteByReciver.length > 0).map((item) => item._id) || []
        setNotedItems(withNotes)

        // Initialize notes object
        const notesObj = {}
        data?.forEach((item) => {
            if (item.noteByReciver && item.noteByReciver.length > 0) {
                notesObj[item._id] = item.noteByReciver
            }
        })
        setNotes(notesObj)
    }, [data])

    // Filter data based on search query
    const filteredData = data?.filter((item) => {
        const nameToSearch = item.senderId?.name?.toLowerCase() || ""
        const phoneToSearch = item.senderId?.number?.toLowerCase() || ""
        const query = searchQuery.toLowerCase()
        return nameToSearch.includes(query) || phoneToSearch.includes(query)
    })

    // Sort data by createdAt date (newest first)
    const sortedData = [...(filteredData || [])].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
    })

    // Get data for current page
    const paginatedData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const totalPages = Math.ceil((filteredData?.length || 0) / ITEMS_PER_PAGE)

    // Refresh data
    const handleRefresh = async () => {
        setIsLoading(true)
        await refresh()
        setIsLoading(false)
    }

    // Calculate time difference for display
    const getTimeDifference = (createdAt) => {
        const now = new Date()
        const created = new Date(createdAt)
        const diffInMs = now - created
        const diffInHours = diffInMs / (1000 * 60 * 60)
        const diffInDays = diffInHours / 24

        if (diffInDays < 1) {
            // Less than a day, show hours
            const hours = Math.floor(diffInHours)
            return {
                text: `${hours} ${hours === 1 ? "hour" : "hours"} ago`,
                isToday: true,
            }
        } else {
            // More than a day, show days
            const days = Math.floor(diffInDays)
            return {
                text: `${days} ${days === 1 ? "day" : "days"} ago`,
                isToday: false,
            }
        }
    }

    // API Functions
    const updateRequestStatus = async (itemId, status) => {
        try {
            setApiLoading(true)
            const response = await axios.post(`${API_URL_APP}/api/v1/heavy/update-request-stauts/${itemId}`, {
                status,
            })

            if (response.data.success) {
                // Update local state
                if (status === "Bookmark") {
                    if (!bookmarkedItems.includes(itemId)) {
                        setBookmarkedItems([...bookmarkedItems, itemId])
                    }
                } else if (bookmarkedItems.includes(itemId)) {
                    setBookmarkedItems(bookmarkedItems.filter((id) => id !== itemId))
                }

                // Show success message
                Alert.alert("Success", response.data.message)

                // Refresh data
                await refresh()
            } else {
                Alert.alert("Error", response.data.message || "Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error.response.data.message)
            Alert.alert("Error", error.response.data.message)
        } finally {
            setApiLoading(false)
        }
    }

    const addNote = async (itemId, note) => {
        try {
            setApiLoading(true)
            const response = await axios.post(`${API_URL_APP}/api/v1/heavy/add-note-request/${itemId}`, {
                note,
            })

            if (response.data.success) {
                // Update local state
                if (!notedItems.includes(itemId)) {
                    setNotedItems([...notedItems, itemId])
                }

                // Update notes object
                setNotes({
                    ...notes,
                    [itemId]: response.data.data,
                })

                // Show success message
                Alert.alert("Success", response.data.message)

                // Refresh data
                await refresh()
            } else {
                Alert.alert("Error", response.data.message || "Failed to add note")
            }
        } catch (error) {
            console.error("Error adding note:", error)
            Alert.alert("Error", "Something went wrong while adding the note")
        } finally {
            setApiLoading(false)
        }
    }

    const editNote = async (requestId, noteId, updatedNote) => {
        try {
            setApiLoading(true)
            const response = await axios.put(`${API_URL_APP}/api/v1/heavy/edit-note-request/${requestId}/${noteId}`, {
                updatedNote,
            })

            if (response.data.success) {
                // Update notes object
                setNotes({
                    ...notes,
                    [requestId]: response.data.data,
                })

                // Show success message
                Alert.alert("Success", response.data.message)

                // Refresh data
                await refresh()
            } else {
                Alert.alert("Error", response.data.message || "Failed to edit note")
            }
        } catch (error) {
            console.error("Error editing note:", error)
            Alert.alert("Error", "Something went wrong while editing the note")
        } finally {
            setApiLoading(false)
        }
    }

    const deleteNote = async (requestId, noteId) => {
        try {
            setApiLoading(true)
            const response = await axios.delete(`${API_URL_APP}/api/v1/heavy/delete-note-request/${requestId}/${noteId}`)

            if (response.data.success) {
                // Update notes object
                setNotes({
                    ...notes,
                    [requestId]: response.data.data,
                })

                // If no notes left, remove from notedItems
                if (!response.data.data || response.data.data.length === 0) {
                    setNotedItems(notedItems.filter((id) => id !== requestId))
                    delete notes[requestId]
                }

                // Show success message
                Alert.alert("Success", response.data.message)

                // Refresh data
                await refresh()
            } else {
                Alert.alert("Error", response.data.message || "Failed to delete note")
            }
        } catch (error) {
            console.error("Error deleting note:", error.response.data.message)
            Alert.alert("Error", "Something went wrong while deleting the note")
        } finally {
            setApiLoading(false)
        }
    }

    // Toggle bookmark status
    const toggleBookmark = (itemId) => {
        const newStatus = bookmarkedItems.includes(itemId) ? "pending" : "Bookmark"
        updateRequestStatus(itemId, newStatus)
    }

    // Open note modal
    const openNoteModal = (itemId) => {
        setCurrentItemId(itemId)
        setNoteText("")
        setEditingNoteId(null)
        setNoteModalVisible(true)
    }

    // Open edit note modal
    const openEditNoteModal = (itemId, noteId, noteContent) => {
        setCurrentItemId(itemId)
        setNoteText(noteContent)
        setEditingNoteId(noteId)
        setNoteModalVisible(true)
    }

    // Handle note submission
    const handleNoteSubmit = () => {
        if (!noteText.trim()) {
            Alert.alert("Error", "Note cannot be empty")
            return
        }

        if (editingNoteId) {
            // Edit existing note
            editNote(currentItemId, editingNoteId, noteText)
        } else {
            // Add new note
            addNote(currentItemId, noteText)
        }

        // Close modal
        setNoteModalVisible(false)
        setNoteText("")
        setEditingNoteId(null)
        setCurrentItemId(null)
    }

    // Render each item
    const renderItem = ({ item }) => {
        const timeDiff = getTimeDifference(item.createdAt)
        const isBookmarked = bookmarkedItems.includes(item._id)
        const hasNote = notedItems.includes(item._id)
        const itemNotes = notes[item._id] || []

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.profileContainer}>
                        {item.senderId.profileImage ? (
                            <Image source={{ uri: item.senderId.profileImage.image }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImagePlaceholderText}>{item.senderId.name?.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item.senderId.name}</Text>
                            <Text style={styles.phoneNumber}>{item.senderId.number}</Text>
                        </View>
                    </View>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusBadge,
                                item.status === "pending"
                                    ? styles.pendingBadge
                                    : item.status === "completed"
                                        ? styles.completedBadge
                                        : item.status === "Bookmark"
                                            ? styles.bookmarkBadge
                                            : styles.otherStatusBadge,
                            ]}
                        >
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.requestInfo}>
                        <Text style={styles.requestType}>
                            <AntDesign name={type === "call" ? "phone" : "message1"} size={16} color="#555" />{" "}
                            {type === "call" ? "Call Request" : "Message Request"}
                        </Text>
                        <View style={styles.timeBadge}>
                            <Text style={[styles.timeText, timeDiff.isToday ? styles.todayText : styles.olderText]}>
                                {timeDiff.text}
                            </Text>
                            {timeDiff.isToday && (
                                <View style={styles.todayBadge}>
                                    <Text style={styles.todayBadgeText}>TODAY</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.timestamp}>
                        <Feather name="clock" size={14} color="#777" />
                        <Text style={styles.dateText}>{new Date(item.createdAt).toString()}</Text>
                    </View>

                    {item.message && <Text style={styles.messageText}>"{item.message}"</Text>}

                    {/* Notes Section */}
                    {hasNote && itemNotes.length > 0 && (
                        <View style={styles.notesSection}>
                            <Text style={styles.notesHeader}>Notes:</Text>
                            {itemNotes.map((note, index) => (
                                <View key={note._id || index} style={styles.noteItem}>
                                    <Text style={styles.noteText}>{note.note}</Text>
                                    <Text style={styles.noteDate}>
    {new Date(note.date).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric', 
        hour12: true
    })}
</Text>

                                    <View style={styles.noteActions}>
                                        <TouchableOpacity
                                            style={styles.noteActionButton}
                                            onPress={() => openEditNoteModal(item._id, note._id, note.note)}
                                        >
                                            <Feather name="edit-2" size={14} color="#2E86DE" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.noteActionButton}
                                            onPress={() => {
                                                Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
                                                    { text: "Cancel", style: "cancel" },
                                                    { text: "Delete", onPress: () => deleteNote(item._id, note._id) },
                                                ])
                                            }}
                                        >
                                            <Feather name="trash-2" size={14} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                // Inside your component's render function or return statement

                <View style={styles.buttonContainer}>
                    {/* TouchableOpacity for "Not Interested" */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => updateRequestStatus(item._id, "Not Interested")}
                        disabled={apiLoading}
                    >
                        <Feather name="thumbs-down" size={20} color="#555" />
                        <Text style={styles.actionText}>Not Interested</Text>
                    </TouchableOpacity>

                    {/* TouchableOpacity for "User By Mistake" */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => updateRequestStatus(item._id, "User By Mistake")}
                        disabled={apiLoading}
                    >
                        <Feather name="x-circle" size={20} color="#555" />
                        <Text style={styles.actionText}>User By Mistake</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => toggleBookmark(item._id)} disabled={apiLoading}>
                        <AntDesign name={isBookmarked ? "star" : "staro"} size={20} color={isBookmarked ? "#FFB800" : "#555"} />
                        <Text style={[styles.actionText, isBookmarked && styles.activeAction]}>
                            {isBookmarked ? "Bookmarked" : "Bookmark"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => openNoteModal(item._id)} disabled={apiLoading}>
                        <MaterialIcons name={hasNote ? "note" : "note-add"} size={20} color={hasNote ? "#4CAF50" : "#555"} />
                        <Text style={[styles.actionText, hasNote && styles.activeAction]}>
                            {hasNote ? "Add More Notes" : "Add Note"}
                        </Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            Alert.alert(
                                "Change Status",
                                "Select a new status:",
                                [
                                    { text: "Cancel", style: "cancel" },

                                    {
                                        text: "Accepted",
                                        onPress: () => updateRequestStatus(item._id, "accepted"),
                                    },
                                    {
                                        text: "Rejected",
                                        onPress: () => updateRequestStatus(item._id, "rejected"),
                                    },
                                    {
                                        text: "Checked",
                                        onPress: () => updateRequestStatus(item._id, "Checked"),
                                    },

                                ],
                                { cancelable: true }
                            );
                        }}
                        disabled={apiLoading}
                    >
                        <Feather name="edit" size={20} color="#555" />
                        <Text style={styles.actionText}>Status</Text>
                    </TouchableOpacity>


                </View>
            </View>
        )
    }

    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No {type} requests found</Text>
            <Text style={styles.emptySubText}>Try a different search or refresh</Text>
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
           

            <View style={styles.searchContainer}>
                <AntDesign name="search1" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${type} requests...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <AntDesign name="close" size={20} color="#777" />
                    </TouchableOpacity>
                )}
            </View>

            {isLoading || apiLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E86DE" />
                </View>
            ) : (
                <>
                    <FlatList
                        data={paginatedData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={EmptyListComponent}
                        onRefresh={handleRefresh}
                        refreshing={isLoading}
                    />

                    {totalPages > 1 && (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                                disabled={currentPage === 1}
                                onPress={() => setCurrentPage(currentPage - 1)}
                            >
                                <AntDesign name="left" size={16} color={currentPage === 1 ? "#ccc" : "#2E86DE"} />
                            </TouchableOpacity>

                            <Text style={styles.pageIndicator}>
                                Page {currentPage} of {totalPages}
                            </Text>

                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                                disabled={currentPage === totalPages}
                                onPress={() => setCurrentPage(currentPage + 1)}
                            >
                                <AntDesign name="right" size={16} color={currentPage === totalPages ? "#ccc" : "#2E86DE"} />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}

            {/* Note Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={noteModalVisible}
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingNoteId ? "Edit Note" : "Add Note"}</Text>

                        <TextInput
                            style={styles.noteInput}
                            placeholder="Enter your note here..."
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline={true}
                            numberOfLines={4}
                            autoFocus={true}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setNoteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleNoteSubmit}>
                                <Text style={styles.saveButtonText}>{editingNoteId ? "Update" : "Save"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    refreshButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        height: 50,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    profileImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#2E86DE",
        justifyContent: "center",
        alignItems: "center",
    },
    profileImagePlaceholderText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    userInfo: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    phoneNumber: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    statusContainer: {
        alignItems: "flex-end",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingBadge: {
        backgroundColor: "#FFF9E6",
    },
    completedBadge: {
        backgroundColor: "#E8F7F0",
    },
    bookmarkBadge: {
        backgroundColor: "#FFF0E0",
    },
    otherStatusBadge: {
        backgroundColor: "#F0F0F0",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
        textTransform: "capitalize",
    },
    cardContent: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 12,
    },
    requestInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    requestType: {
        fontSize: 14,
        fontWeight: "500",
        color: "#555",
    },
    timeBadge: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 12,
        marginRight: 6,
    },
    todayText: {
        color: "#2E86DE",
    },
    olderText: {
        color: "#888",
    },
    todayBadge: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    todayBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#2E86DE",
    },
    timestamp: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    dateText: {
        fontSize: 12,
        color: "#777",
        marginLeft: 6,
    },
    messageText: {
        fontSize: 14,
        color: "#555",
        fontStyle: "italic",
        marginTop: 6,
        lineHeight: 20,
    },
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 12,
        color: "#555",
        marginLeft: 4,
    },
    activeAction: {
        fontWeight: "500",
        color: "#2E86DE",
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    pageButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f5f6fa",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.5,
    },
    pageIndicator: {
        fontSize: 14,
        color: "#555",
        marginHorizontal: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#888",
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: "#aaa",
        marginTop: 8,
    },
    // Notes Section Styles
    notesSection: {
        marginTop: 12,
        padding: 10,
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
    },
    notesHeader: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
        marginBottom: 8,
    },
    noteItem: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    noteText: {
        fontSize: 13,
        color: "#555",
        lineHeight: 18,
    },
    noteDate: {
        fontSize: 11,
        color: "#888",
        marginTop: 4,
    },
    noteActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 6,
    },
    noteActionButton: {
        padding: 4,
        marginLeft: 10,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "90%",
        maxWidth: 400,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
        textAlign: "center",
    },
    noteInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: "#2E86DE",
        marginLeft: 10,
    },
    cancelButtonText: {
        color: "#555",
        fontWeight: "600",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
})
