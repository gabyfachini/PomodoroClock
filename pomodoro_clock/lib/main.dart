import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

void main() {
  runApp(const PomodoroApp());
}

class PomodoroApp extends StatelessWidget {
  const PomodoroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pomodoro Clock',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.red.shade900,
      ),
      home: const PomodoroClock(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class PomodoroClock extends StatefulWidget {
  const PomodoroClock({super.key});

  @override
  State<PomodoroClock> createState() => _PomodoroClockState();
}

class _PomodoroClockState extends State<PomodoroClock> {
  late Timer _timer;
  Duration _timeLeft = const Duration(minutes: 25);
  bool _isWorking = true;
  int _pomodoroCount = 0;

  @override
  void initState() {
    super.initState();
    startTimer();
  }

  void startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft.inSeconds > 0) {
        setState(() {
          _timeLeft = _timeLeft - const Duration(seconds: 1);
        });
      } else {
        setState(() {
          _isWorking = !_isWorking;
          _timeLeft = _isWorking ? const Duration(minutes: 25) : const Duration(minutes: 5);
          if (_isWorking) _pomodoroCount++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    double totalSeconds = (_isWorking ? 25 * 60 : 5 * 60).toDouble();
    double secondsElapsed = totalSeconds - _timeLeft.inSeconds.toDouble();

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Pomodoros: $_pomodoroCount',
              style: const TextStyle(
                fontSize: 24,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 50),
            CustomPaint(
              size: const Size(300, 300),
              painter: ClockPainter(
                seconds: secondsElapsed,
                totalSeconds: totalSeconds,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _isWorking ? 'Focus Time' : 'Break Time',
              style: const TextStyle(
                fontSize: 28,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              '${_timeLeft.inMinutes.toString().padLeft(2, '0')}:${(_timeLeft.inSeconds % 60).toString().padLeft(2, '0')}',
              style: const TextStyle(
                fontSize: 48,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ClockPainter extends CustomPainter {
  final double seconds;
  final double totalSeconds;

  ClockPainter({
    required this.seconds,
    required this.totalSeconds,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width/2, size.height/2);
    final radius = min(size.width/2, size.height/2);

    final backgroundPaint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    final outlinePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    final progressPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final secondHandPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2;

    final minuteHandPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 4;

    // Draw clock face
    canvas.drawCircle(center, radius, backgroundPaint);
    canvas.drawCircle(center, radius, outlinePaint);

    // Progress arc
    double angle = 2 * pi * (seconds / totalSeconds);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 10),
      -pi/2,
      angle,
      false,
      progressPaint,
    );

    // Draw minute hand
    final minutesAngle = (seconds / 60) * 2 * pi / 60;
    final minuteHandX = center.dx + radius * 0.6 * cos(minutesAngle - pi/2);
    final minuteHandY = center.dy + radius * 0.6 * sin(minutesAngle - pi/2);
    canvas.drawLine(center, Offset(minuteHandX, minuteHandY), minuteHandPaint);

    // Draw second hand
    final secondAngle = (seconds % 60) * 2 * pi / 60;
    final secondHandX = center.dx + radius * 0.9 * cos(secondAngle - pi/2);
    final secondHandY = center.dy + radius * 0.9 * sin(secondAngle - pi/2);
    canvas.drawLine(center, Offset(secondHandX, secondHandY), secondHandPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
