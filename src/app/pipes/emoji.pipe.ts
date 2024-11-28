import { Injectable, Pipe, PipeTransform } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'emoji',
  standalone: true
})
export class EmojiPipe implements PipeTransform {

  private emojiMap: { [key: string]: string } = {
    love: '❤️',
    happy: '😊',
    sad: '😢',
    angry: '😡',
    laugh: '😂',
    cry: '😭',
    good: '👍',
    bad: '👎',
    fire: '🔥',
    star: '⭐',
    xd: '😝'
  };

  transform(value: string): string {
    console.log(value);
    return value
      .split(' ')
      .map(word => this.emojiMap[word.toLowerCase()] || word) 
      .join(' '); 
  }

}
