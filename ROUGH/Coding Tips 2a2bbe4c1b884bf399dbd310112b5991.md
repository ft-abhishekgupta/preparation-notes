# Coding Tips

# Coding Tips (C++)

- Clean Coding Style
- Read about Language
- Read Question Carefully
- Understand Logic and its flow and write it on paper, before coding
- Write smallest code
- Read Editorial after submission / Explore other's code

## Common Errors

1. **Division by 0** : Take care
2. **Segmentation Fault : Invalid Memory Location Access** : Check corner cases
3. **Declaring array of size > 10^8** : Dont
    - 10^6 : Max Array size in main
    - 10^7 : Max Array size in global
4. **Integer Overflow** : Use long long (also type cast before operation)
    - long long int z = 1LL * x * y;
5. **Comparing float/double - Precision Fault** : Use approximation
    - abs(a -10) < (0.0000001)

# Useful CODES (C++)

## Template

```cpp
#include <bits/stdc++.h>//All Required Librariestypedef long long ll;
typedef pair<int, int> ii;
typedef vector<ii> vii;
typedef vector<int> vi;
const int INF = 0x3f3f3f3f;
using namespace std;
int main(){
//Fast IO Commands - also use "\n" instead of endl
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
//CODEreturn 0;
}

```

- g++ -std=c++11 code.cpp -o code // To Run CPP 11 Code

### Range loops

```cpp
for(auto n:v){}// For accessing values
for(auto &n:v){}// For modifying values
//Complex
deque<vector<pair<int, int>>> d;
d = {{{3, 4}, {5, 6}}, {{1, 2}, {3, 4}}};
for (auto i: d) {
    for (auto j: i)
        cout << j.first << ' ' << j.second << '\n';
    cout << "\n";
}

```

### Macro For loop

```cpp
#define FOR(i,k,n) for (i = k; i <= n; ++i)
#define RFOR(i,k,n) for (i = k; i >= n; --i)
FOR(i,0,L){}
RFOR(i,L,0){}

```

### Variable Argument Function

```cpp
template<typename... Args>
int sum() { return 0; }
int sum(int a, Args... args) { return a + sum(args...); }
sum(1,2,3,4,5);

```

### Debuging

```cpp
//Prints name and value of variable by calling watch(i)#define watch(x) cout << (#x) << " is " << (x) << endl

```

### Scanning unknown lines of input

```cpp
#include <iostream>using namespace std;
...
// numbersint n;
while (cin >> n)
{
   ...
}
// lines
string line;
while (getline(cin, line))
{
   ...
}
// characterschar c;
while (cin.get(c))
{
   ...
}

```

### Scanning using getLine

```cpp
string s;
cin.ignore(1, '\n');//Ignore "\n" left in bufferfor (int i = 0; i<n; ++i){
    getline(cin, s);
    cout << s.length() << " ";
    cout << s << endl;
}

```

### Using Modulo

```cpp
#define mod 1000000007
z = ((z%mod) + ((x%mod)*(y%mod))%mod) % mod;// z = z + x*y

```

### Bit Operation Tricks

```cpp
//Built In functions
__builtin_ffs(x)// 1 + Index of 1st 1 from right
__builtin_clz(x)// Number of leading 0s
__builtin_ctz(x)// Number of trailing 0s
__builtin_popcount(x)// Number of 1s//Clear all bits from LSB to ith bit
mask = ~((1 << i+1 ) - 1);
x &= mask;

//Clearing all bits from MSB to i-th bit
mask = (1 << i) - 1;
x &= mask;

// Setting ith bit
num|=(1<<i);

// clearing the ith bit
num=num & ~(1<<i);

// flipping ith bit
num ^ = (1<<i);

// Fast multiplication/division by 2
n = n << 1;// Multiply n with 2
n = n >> 1;// Divide n by 2//Count 1while (x) {
    x &= (x-1);
    count++;
}

//Number power of 2bool ans = x && (!(x&(x-1)));

//Log Base 2while (x >>= 1)
    ans++;

//Case Conversion
ch |= ' ';// Upper -> Lower
ch &= '_’;

```

### STL

```cpp
//Lambda Function :
[](argument1,argument2,.....){//code}//Copycopy_n(sourcecontainer, size, targetcontainer);

// are < > of the elements positive?all_of(a, a+n, ispositive());
any_of(a, a+n, myfunction());
none_of(a, a+n, [](int x) { return x>0; });//Lambda function//iotaint a[5] = {0}; char c[3] = {0};
iota(a, a+5, 10);//{10, 11, 12, 13, 14}iota(c, c+3, 'a');// {'a', 'b', 'c'}// When Pair is not enoughtuple(int,int,char,int) t = make_tuple(1,2,'a',3);
cout << get<0> t1;// Access//ALGORITHMS
vector<int> w = move(v);// Gets moved not copiedsort(vect.begin(), vect.end());
sort(v.begin(),v.end(),[](int a,int b){return a>b;});//Descending sortsort(v.begin(),v.end(), [=](int i, int j) { return a[i] < a[j]; });//Stablereverse(vect.begin(), vect.end());
int n = *max_element(vect.begin(), vect.end());
int n = *min_element(vect.begin(), vect.end());
int n = accumulate(vect.begin(), vect.end(), 0);// Sumint n = count(vect.begin(), vect.end(), 20);// Count occurrencefind(vect.begin(), vect.end(),5) != vect.end() ? cout << "F" : cout << "NF";
auto q = lower_bound(vect.begin(), vect.end(), 20);//First occurrenceauto q = upper_bound(vect.begin(), vect.end(), 20);//Last occurrence
v.erase(v.begin()+i);
vect.erase(unique(vect.begin(),vect.end()),vect.end());//Delete Duplicatesnext_permutation(vect.begin(), vect.end());
prev_permutation(vect.begin(), vect.end());
distance(vect.begin(),vect.end());

```

### Tricks

```cpp
// use auto for variablesauto a = 1;// a will become 'int'auto b = 1LL;// b will become 'long long'auto c = 1.0;// c will become 'double'auto d = "variable";// d will become 'string'// Assign multiple variablestie (a, b, c) = make_tuple(4,1,'a');// a = 4 , b = 1 , c = 'a// RAW Strings
string r_str = R"(Hello\tWorld\n)";//Hello\tWorld\n AND NOT Hello   World// Accurate PIconst double pi = 2 * acos(0.0)

// initialize DP memoization table with -1memset(memo, -1, sizeof memo);

// to clear array of integersmemset(arr, 0, sizeof arr);

// Creates a vector of size N and values as 0.vi v(N, 0);

// Find minimum of many variablesint a = min({x1,x2,x2,x3,x4,x5});

// to simplify: if (a) ans = b; else ans = c;
ans = a ? b : c;

// Check Even/Oddif (num & 1) cout << "ODD";
else cout << "EVEN";

// Quick Swap without 3rd Variable
a ^= b; b ^= a; a ^= b;

// Built in Swapswap(c,d);

// Strlen avoidedfor (i=0; s[i]; i++){}

// Fast STL Insertion/Deletionemplace in place of push (emplace_back(),emplace(),emplace_front())

// Inbuilt GCD
__gcd(x, y);

// Circular Index
index = (index + 1) % n;//index++
index = (index + n - 1) % n;//index--// Rounding to nearest integerint ans = (int)((double)d + 0.5);

// Number of digits in numberfloor(log10(N)) + 1

// MSD of numberdouble K = log10(N);
K = K - floor(K);
int X = pow(10, K);

// min/max shortcut to update
ans = min(ans, new_computation);

// Assign as binaryauto number = 0b011;  cout << number;//3// Use Relational Operatorsreturn (val == given_no)

// Replace if(cond) x++ with
x += cond

// Change Sign
A = -A;

```