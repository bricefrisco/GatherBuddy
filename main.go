package main

import (
	"fmt"
	"github.com/bricefrisco/albion-listener/listener"
)

func main() {
	msgChan := make(chan *listener.Message, 1000)
	listener := listener.NewListener(msgChan)
	go listener.Run()

	for message := range msgChan {
		fmt.Println(message)
	}
}
