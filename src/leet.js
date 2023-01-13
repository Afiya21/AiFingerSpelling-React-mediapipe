function reverseString(s) {
  let end = s.length - 1;
  for (let i = 0; i < s.length; i++, end--) {
    let temp = s[i];
    s[i] = s[end];
    s[end] = temp;
  }
}
let s = ["h", "e", "l", "l", "o"];
reverseString(s);
console.log(s);
