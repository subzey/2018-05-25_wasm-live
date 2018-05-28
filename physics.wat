(module
	(global $count (import "conf" "count") i32)
	(func $random (import "Math" "random") (result f32))
	(func $sin (import "Math" "sin") (param f32) (result f32))
	(func $cos (import "Math" "cos") (param f32) (result f32))

	(memory 0)

	(start $main)

	(func $main
		;; _ = $count * 16
		(i32.mul (get_global $count) (i32.const 16))

		;; _ = _ + 0xFFFF
		(i32.add (i32.const 0xFFFF))

		;; _ = _ >>> 16
		(i32.shr_u (i32.const 16))

		(grow_memory)

		(drop)
	)

	(func (export "fire")
		(param $x f32)
		(param $y f32)
		(local $len i32)
		(local $ptr i32)
		(local $amplitude f32)
		(local $angle f32)

		(set_local $len
			(i32.mul
				(get_global $count)
				(i32.const 16)
			)
		)

		;; Filling
		(loop $each-point
			(set_local $amplitude
				(f32.mul (f32.sqrt (call $random)) (f32.const 20))
			)
			(set_local $angle
				(f32.mul (call $random) (f32.const 6.283185307179586))
			)

			(f32.store offset=0 (get_local $ptr)
				(get_local $x)
			)
			(f32.store offset=4 (get_local $ptr)
				(get_local $y)
			)
			(f32.store offset=8 (get_local $ptr)
				(f32.mul
					(get_local $amplitude)
					(call $cos (get_local $angle))
				)
			)
			(f32.store offset=12 (get_local $ptr)
				(f32.mul
					(get_local $amplitude)
					(call $sin (get_local $angle))
				)
			)

			;; $ptr = $ptr + 16; _ = $ptr
			(tee_local $ptr
				(get_local $ptr)
				(i32.add (i32.const 16))
			)

			;; if (_ < $len) continue;
			(br_if $each-point
				(i32.lt_u
					(get_local $len)
				)
			)
		)
	)

	(func (export "physics")
		(local $ptr i32)
		(local $len i32)

		(set_local $len
			(i32.mul
				(get_global $count)
				(i32.const 16)
			)
		)
		(loop $each-point
			;; mem[$ptr + 0] += mem[$ptr + 8]
			(f32.store offset=0 (get_local $ptr)
				(f32.add
					(f32.load offset=0 (get_local $ptr))
					(f32.load offset=8 (get_local $ptr))
				)
			)

			;; mem[$ptr + 4] += mem[$ptr + 12]
			(f32.store offset=4 (get_local $ptr)
				(f32.add
					(f32.load offset=4 (get_local $ptr))
					(f32.load offset=12 (get_local $ptr))
				)
			)

			;; mem[$ptr + 12] = mem[$ptr + 12] + 0.25
			(f32.store offset=12 (get_local $ptr)
				(f32.load offset=12 (get_local $ptr))
				(f32.add (f32.const 0.25))
			)

			;; $ptr = $ptr + 16; _ = $ptr
			(tee_local $ptr
				(get_local $ptr)
				(i32.add (i32.const 16))
			)

			;; if (_ < $len) continue;
			(br_if $each-point
				(i32.lt_u
					(get_local $len)
				)
			)
		)
	)

	(export "mem" (memory 0))
)
