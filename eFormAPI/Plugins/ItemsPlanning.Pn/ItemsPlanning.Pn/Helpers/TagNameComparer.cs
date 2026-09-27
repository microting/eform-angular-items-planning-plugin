/*
The MIT License (MIT)

Copyright (c) 2007 - 2026 Microting A/S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

namespace ItemsPlanning.Pn.Helpers;

using System;
using System.Globalization;

/// <summary>
/// The one order for planning tag names (#2126). Always Danish (a…z, æ, ø, å),
/// case-insensitive, regardless of the user's UI language, so every tag picker
/// shows the same order. The database collation (utf8mb4_general_ci) folds Å to A,
/// so tags are sorted in memory with this comparer instead of in SQL.
/// Needs ICU at runtime (InvariantGlobalization must stay off in the host).
/// </summary>
public static class TagNameComparer
{
    public static readonly StringComparer Danish =
        StringComparer.Create(CultureInfo.GetCultureInfo("da-DK"), ignoreCase: true);
}
