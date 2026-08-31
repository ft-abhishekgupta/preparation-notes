## Minimum Meeting Rooms Required

1. Associate start time with +1, end time with -1
2. Put everything in an array and sort
3. Iterate and calculate running max

```cs
public int MinMeetingRooms(List<Interval> intervals) {
    int max = 0, len = intervals.Count, curr = 0;
    var arr = new(int x, int y)[len * 2];
    for (int i = 0; i < len; i++) {
        arr[i] = (intervals[i].start, 1);
        arr[i + len] = (intervals[i].end, -1);
    }
    Array.Sort(arr, (a, b) =>
        a.x != b.x ? a.x.CompareTo(b.x) : a.y.CompareTo(b.y));
    for (int i = 0; i < len * 2; i++) {
        curr += arr[i].y;
        max = Math.Max(max, curr);
    }
    return max;
}
```

## Merge A New Interval

1. Tackle case by case. Interval before, overlapping, after

```cs
public int[][] Insert(int[][] intervals, int[] newI) {
        int len = intervals.Length;
        int start = newI[0];
        int end = newI[1];
        var ans = new List<int[]>();
        int i = 0;
        while(i < len && intervals[i][1] < newI[0])
            ans.Add(intervals[i++]);
        while(i < len && intervals[i][0] <= newI[1]){
            start = Math.Min(intervals[i][0],start);
            end = Math.Max(intervals[i][1],end);
            i++;
        }
        ans.Add([start,end]);
        while(i < len)
            ans.Add(intervals[i++]);
        return ans.ToArray();
    }
```
