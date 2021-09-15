import { useState, useEffect } from "react";
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

  useEffect(() => {
    async function getSchedule() {
      const year = new Date().getFullYear();
      const response = await api.get(`schedule/${year}`);
      setValues(response.data.daysOff);
    }
    getSchedule();
  }, []);

  async function handleSubmit() {
    if (values.length > 0) {
      const daysOff = values.map((date) => {
        return `${date.year}-${String(date.month.index + 1).padStart(
          2,
          "0"
        )}-${String(date.day).padStart(2, "0")}`;
      });

      const id = String(new Date().getFullYear());

      try {
        const response = await api.post("schedule", { id, daysOff, password });
        toast.success("Escala atualizada com sucesso");
      } catch (err) {
        toast.error("Error ao atualizar escala :/");
      }
    } else {
      toast.error("Por favor selecione alguma data");
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
