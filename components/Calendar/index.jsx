import { useState } from "react";
import Link from "next/link";
import DatePicker from "react-multi-date-picker";
import { toast } from "react-toastify";
import { MdArrowBack } from "react-icons/md";
import DatePickerButton from "react-multi-date-picker/components/icon";
import { Container, Button, Input, ArrowWrapper } from "./styles";
import api from "../../services/api";

function Calendar() {
  const [values, setValues] = useState([]);
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    const daysOff = values.map((date) => {
      return `${date.year}/${String(date.month.index + 1).padStart(
        2,
        "0"
      )}/${String(date.day).padStart(2, "0")}`;
    });

    const id = `${values[0].year}-${String(values[0].month.index + 1).padStart(
      2,
      "0"
    )}`;

    try {
      await api.post("schedule", { id, daysOff, password });
      toast.success("Escala atualizada com sucesso");
    } catch (err) {
      toast.error("Error ao atualizar escala :/");
    }
  }

  return (
    <Container>
      <h1>Escala da Rosenda</h1>
      <DatePicker
        value={values}
        onChange={setValues}
        calendarPosition={`bottom-center`}
        render={<DatePickerButton />}
      />
      <Input
        placeholder="Senha"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleSubmit}>Enviar folgas</Button>
      <Link href="/">
        <ArrowWrapper>
          <MdArrowBack />
        </ArrowWrapper>
      </Link>
    </Container>
  );
}

export default Calendar;
