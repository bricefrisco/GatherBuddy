package main

import (
	"encoding/json"
	"fmt"
	"github.com/bricefrisco/albion-listener/listener"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

var upgrader = websocket.Upgrader{}

type Client struct {
	conn *websocket.Conn
}

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
)

func handleWS(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true } // Disable CORS

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading connection:", err)
		return
	}

	client := &Client{conn: conn}
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	log.Println("New WebSocket connection")
}

func broadcast(msg *listener.Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Println("Error marshaling message:", err)
		return
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		err := client.conn.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Println("Write failed, closing connection:", err)
			client.conn.Close()
			delete(clients, client)
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleWS)
	log.Println("Starting server on :8080")
	go http.ListenAndServe(":8080", nil)

	msgChan := make(chan *listener.Message, 1000)
	listener := listener.NewListener(msgChan)
	go listener.Run()

	for message := range msgChan {
		broadcast(message)
	}
}
