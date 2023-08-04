export const cardCount: number[] = [];
function printFibonacci(n:number):void {
    let a:number = 0, b:number = 1, c:number;
    for (let i = 2; i < n; i++) {
      c = a + b;
      if (!cardCount.includes(a)){
        cardCount.push(a)
      }
      a = b;
      b = c;
    }
  }
  printFibonacci(13);